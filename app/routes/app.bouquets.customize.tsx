import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
  useActionData,
  Await,
} from "@remix-run/react";
import {
  Card,
  Divider,
  Layout,
  List,
  Page,
  Text,
  BlockStack,
  PageActions,
  Thumbnail,
  BannerHandles,
} from "@shopify/polaris";
import { Suspense, useEffect, useRef, useState } from "react";
import { defer, json, redirect } from "@remix-run/node";
import type {
  BouquetCustomizationForm,
  ByobCustomizerOptions,
  OptionValueCustomizations,
  SerializedCustomizeForm,
  SerializedTwoWayFallbackMap,
} from "~/types";
import { authenticate } from "../shopify.server";

import { getBYOBOptions } from "~/server/controllers/getBYOBOptions";
import { saveCustomizations } from "~/server/controllers/saveCustomizations";
import { CustomizationSection } from "~/components/customizations/CustomizationSection";
import { Flower, Palette } from "@prisma/client";
import { FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME } from "~/constants";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { sanitizeData } from "~/server/utils/sanitizeData";
import { activateProductInOnlineStore } from "~/server/controllers/activateProductInOnlineStore";
import { captureException } from "@sentry/remix";
import { ServerErrorBanner } from "~/components/errors/ServerErrorBanner";
import { CustomizationsFormSkeleton } from "~/components/skeletons/CustomizationsFormSkeleton";

const SETTINGS_PATH = "/app/bouquets/settings";

export async function loader({ request }) {
  const byobOptions: ByobCustomizerOptions = getBYOBOptions(request);

  return defer({
    byobOptions,
  });
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const serializedData = await request.formData();

    const data: SerializedCustomizeForm = JSON.parse(serializedData.get("data"));

    sanitizeData(data);
    await saveCustomizations(admin, data);
    await activateProductInOnlineStore(admin, data.product);

    return redirect(`/app`);
  } catch (err) {
    console.error(err);
    captureException(err);
    return json({ backendError: true });
  }
}

const createSizeValueCustomizationsObject = (sizeEnumsAvailable: string[], selectedSizeEnums: string[],
  sizeEnumToPrice: { [key: string]: number }, sizeEnumToName: SerializedTwoWayFallbackMap) => {
  if (!selectedSizeEnums) {
    return {};
  }
  const rv = {};
  sizeEnumsAvailable.forEach((sizeEnum) => {
    if (selectedSizeEnums.includes(sizeEnum)) {
      rv[sizeEnum] = {
        name: TwoWayFallbackMap.getValue(sizeEnum, sizeEnumToName.customMap, sizeEnumToName.defaultMap),
        price: sizeEnumToPrice[sizeEnum] != undefined ? sizeEnumToPrice[sizeEnum] : 0,
        connectedLeft: null
      }
    }
  });
  return rv;
}

const createPaletteValueCustomizationsObject = (availablePalettes: Palette[], paletteIdsSelected: string[],
  backendIdToName: SerializedTwoWayFallbackMap) => {
  if (!paletteIdsSelected) {
    return {};
  }
  return paletteIdsSelected.reduce((acc: OptionValueCustomizations, paletteId) => {
    const selectedName = TwoWayFallbackMap.getValue(paletteId, backendIdToName.customMap, backendIdToName.defaultMap);
    const palette = availablePalettes.find(palette => palette.id.toString() === paletteId)

    acc[selectedName] = {
      name: selectedName,
      price: 0,
      connectedLeft: (palette && <Thumbnail
        size="large"
        alt={"Photo of palette " + selectedName}
        source={palette.imageLink}
      />),
    };
    return acc;
  }, {});
};

const createFlowerValueCustomizationsObject = (availableFocalFlowers: Flower[], optionValues: string[], optionValueToPrice: { [key: string]: number }) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    const flowerImageLink = availableFocalFlowers.find(palette => palette.name === value)?.imageLink

    acc[value] = {
      name: value,
      price: optionValueToPrice[value] != undefined ? optionValueToPrice[value] : 0,
      connectedLeft: <Thumbnail
        size="large"
        alt={"Photo of " + value}
        source={flowerImageLink ?? ""}
      />
    };
    return acc;
  }, {});
};

type ByobCustomizationFormProps = {
  formOptions: ByobCustomizerOptions
  backendError: boolean
  isSaving: boolean
}

const ByobCustomizationForm = ({
  formOptions,
  backendError,
  isSaving
}: ByobCustomizationFormProps) => {
  const form: BouquetCustomizationForm = {
    optionCustomizations: {
      [SIZE_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[SIZE_OPTION_NAME],
        optionValueCustomizations: createSizeValueCustomizationsObject(
          formOptions.sizesAvailable,
          formOptions.sizesSelected,
          formOptions.productMetadata.sizeToPrice,
          formOptions.sizeEnumToName
        ),
      },
      [PALETTE_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[PALETTE_OPTION_NAME],
        optionValueCustomizations: createPaletteValueCustomizationsObject(
          formOptions.palettesAvailableSorted,
          formOptions.palettesSelected,
          formOptions.paletteBackendIdToName
        ),
      },
      [FLOWER_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[FLOWER_OPTION_NAME],
        optionValueCustomizations: createFlowerValueCustomizationsObject(
          formOptions.flowersAvailableSorted,
          formOptions.flowersSelected,
          formOptions.productMetadata.flowerToPrice
        ),
      }
    },
    productMetadata: formOptions.productMetadata,
    optionToNameUpdates: {},
    sizeToPriceUpdates: {},
    flowerToPriceUpdates: {},
    paletteToNameUpdates: {},
    sizeToNameUpdates: {}
  }

  const [formState, setFormState] = useState(form);

  const navigate = useNavigate();

  const submit = useSubmit();

  const backendErrorBanner = useRef<BannerHandles>(null);
  useEffect(() => backendErrorBanner.current?.focus(), [backendError]);

  function submitFormData() {
    const data: SerializedCustomizeForm = {
      product: formOptions.customProduct,
      productMetadata: formOptions.productMetadata,
      sizeToPriceUpdates: formState.sizeToPriceUpdates,
      flowerToPriceUpdates: formState.flowerToPriceUpdates,
      optionToNameUpdates: formState.optionToNameUpdates,
      paletteToNameUpdates: formState.paletteToNameUpdates,
      paletteBackendIdToName: formOptions.paletteBackendIdToName,
      sizeToNameUpdates: formState.sizeToNameUpdates,
      sizeEnumToName: formOptions.sizeEnumToName,
    };

    if (backendError) {
      return;
    }
    const serializedData = JSON.stringify(data);

    submit({ data: serializedData }, { method: "post" });
  }

  return (
    <Page
      backAction={{ content: 'Settings', url: SETTINGS_PATH }}
      title="Customize"
      subtitle="Customize your Build-Your-Own-Bouquet Product"
      compactTitle
      pagination={{
        hasPrevious: true,
        onPrevious: () => navigate(SETTINGS_PATH),
      }}
    >
      <Layout>
        {(backendError) && <Layout.Section>
          <ServerErrorBanner banner={backendErrorBanner} />
        </Layout.Section>
        }
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Edit Bouquet Option Names and Prices
                </Text>
                <CustomizationSection
                  optionKey={SIZE_OPTION_NAME}
                  shouldSetPrice={true}
                  shouldSetName={true}
                  shouldSortOptions={false}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Sizes
                      </Text>
                      <List type="bullet">
                        <List.Item>
                          {"Customize the naming for your size options -- for example, rename \"Small\" to \"Modest\"."}
                        </List.Item>
                        <List.Item>
                          Edit the prices for each bouquet size. This will be the base price for the product.
                        </List.Item>
                      </List>
                    </>
                  }
                  optionCustomizations={form.optionCustomizations[SIZE_OPTION_NAME]}
                  formState={formState}
                  setFormState={setFormState}
                  optionValueToPriceUpdates={formState.sizeToPriceUpdates}
                />
                <Divider />
                <CustomizationSection
                  optionKey={PALETTE_OPTION_NAME}
                  shouldSetPrice={false}
                  shouldSetName={true}
                  shouldSortOptions={true}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Palettes
                      </Text>
                      <List type="bullet">
                        <List.Item>
                          {"Customize the naming for your palette options - for example, rename \"Pastel\" to \"Soft\"."}
                        </List.Item>
                      </List>
                    </>
                  }
                  optionCustomizations={form.optionCustomizations[PALETTE_OPTION_NAME]}
                  formState={formState}
                  setFormState={setFormState}
                  optionValueToPriceUpdates={{}}
                />
                <Divider />
                <CustomizationSection
                  optionKey={FLOWER_OPTION_NAME}
                  shouldSetPrice={true}
                  shouldSetName={false}
                  shouldSortOptions={true}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Main Flowers
                      </Text>
                      <List type="bullet">
                        <List.Item>
                          Edit the add-on price for each main flower.
                        </List.Item>
                      </List>
                      <Text as="h2" variant="bodyMd">
                        If the customer chooses a main flower with an add-on price, this will be in addition to the base price for the product.
                        For example, if the base price for a "Small" bouquet is $40 and the customer chooses a main flower with an add-on price of $5, the total price will be $45.
                      </ Text>
                    </>
                  }
                  optionCustomizations={form.optionCustomizations[FLOWER_OPTION_NAME]}
                  formState={formState}
                  setFormState={setFormState}
                  optionValueToPriceUpdates={formState.flowerToPriceUpdates}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={
              {
                content: "Save and continue",
                loading: isSaving,
                disabled: isSaving,
                onAction: submitFormData,
              }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function LoadingCustomizationForm() {
  const { byobOptions } = useLoaderData<typeof loader>();
  const backendError: boolean = useActionData()?.backendError || false;
  const nav = useNavigation();
  const isSaving =
    (nav.state === "submitting" || nav.state === "loading") && nav.location.pathname !== SETTINGS_PATH;
    
  return (
    <Suspense fallback={<CustomizationsFormSkeleton />}>
      <Await resolve={byobOptions} >
        {
          (byobOptions) =>
            <ByobCustomizationForm
              formOptions={byobOptions}
              backendError={backendError}
              isSaving={isSaving}
            />
        }
      </Await>
    </Suspense>
  )
}

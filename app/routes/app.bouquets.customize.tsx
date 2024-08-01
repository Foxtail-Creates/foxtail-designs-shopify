import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
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
} from "@shopify/polaris";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import type {
  BouquetCustomizationForm,
  ByobCustomizerOptions,
  OptionValueCustomizations,
  SerializedCustomizeForm,
  SerializedTwoWayFallbackMap,
} from "~/types";
import { authenticate } from "../shopify.server";

import { getBYOBOptions } from "~/server/getBYOBOptions";
import { saveCustomizations } from "~/server/saveCustomizations";
import { CustomizationSection } from "~/components/customizations/CustomizationSection";
import { Flower, Palette } from "@prisma/client";
import { Palette as PaletteComponent } from "~/components/palettes/Palette";
import { FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME } from "~/constants";
import { TwoWayFallbackMap } from "~/server/TwoWayFallbackMap";
import { sanitizeData } from "~/server/sanitizeData";
import { activateProduct } from "~/server/activateProduct";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const byobOptions: ByobCustomizerOptions = await getBYOBOptions(admin);

  return json(byobOptions);
}


export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  const serializedData = await request.formData();

  const data: SerializedCustomizeForm = JSON.parse(serializedData.get("data"));

  sanitizeData(data);
  saveCustomizations(admin, data);
  if (data.product.status !== "ACTIVE") {
    activateProduct(admin, data.product.id);
  }

  return redirect(`/app`);
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

const createValueCustomizationsObject = (optionValues: string[], optionValueToPrice: { [key: string]: number }) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    acc[value] = {
      name: value,
      price: optionValueToPrice[value] != undefined ? optionValueToPrice[value] : 0,
      connectedLeft: null
    };
    return acc;
  }, {});
};

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
      connectedLeft: (palette && <PaletteComponent color1={palette.color1} color2={palette?.color2} color3={palette?.color3} />),
    };
    return acc;
  }, {});
};

const createFlowerValueCustomizationsObject = (availableFocalFlowers: Flower[], optionValues: string[]) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    const flowerImageLink = availableFocalFlowers.find(palette => palette.name === value)?.imageLink

    acc[value] = {
      name: value,
      price: 0,
      connectedLeft: <Thumbnail
        size="large"
        alt={"Photo of " + value}
        source={flowerImageLink ?? ""}
      />
    };
    return acc;
  }, {});
};

export default function ByobCustomizationForm() {
  const formOptions: ByobCustomizerOptions = useLoaderData();

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
          formOptions.palettesAvailable,
          formOptions.palettesSelected,
          formOptions.paletteBackendIdToName
        ),
      },
      [FLOWER_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[FLOWER_OPTION_NAME],
        optionValueCustomizations: createValueCustomizationsObject(formOptions.flowersSelected, formOptions.productMetadata.flowerToPrice),
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

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting";

  const navigate = useNavigate();

  const submit = useSubmit();
  // TODO: https://linear.app/foxtail-creates/issue/FOX-35/shopify-app-frontend-edit-preset-names-and-descriptions

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
      sizeEnumToName: formOptions.sizeEnumToName
    };

    const serializedData = JSON.stringify(data);

    submit({ data: serializedData }, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={"Customize product variations"}>
        <button
          variant="breadcrumb"
          onClick={() => navigate("/app/bouquets/settings")}
        >
          Go back to settings
        </button>
      </ui-title-bar>
      <Layout>
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
                      <List type="number">
                        <List.Item>
                          Customize the naming for your size options -- for example, rename 'Size' to 'Bouquet Size' and 'Small' to 'Petite'.
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
                      <List type="number">
                        <List.Item>
                          Customize the naming for your palette options - for example, rename 'Palette' to 'Color Scheme' and 'Pastel' to 'Soft'.
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
                        Focal Flowers
                      </Text>
                      <List type="number">
                        <List.Item>
                          Customize the naming for your focal flower options - for example, rename 'Focal Flower' to 'Main Flower'.
                        </List.Item>
                        <List.Item>
                          Edit the add-on price for each focal flower. If the customer chooses a focal flower with an add-on price, this will be in addition to the base price for the product.
                        </List.Item>
                      </List>
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
            primaryAction={{
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

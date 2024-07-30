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
} from "~/types";
import { authenticate } from "../shopify.server";

import { getBYOBOptions } from "~/server/getBYOBOptions";
import { CustomizationSection } from "~/components/customizations/CustomizationSection";
import { Flower, Palette } from "@prisma/client";
import { Palette as PaletteComponent } from "~/components/palettes/Palette";
import { FLOWER_OPTION_NAME, FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_PRICES, SIZE_OPTION_NAME } from "~/constants";
import { updateOptionName } from "~/server/updateOptionNames";
import { updateVariants } from "~/server/updateVariants";
import { setProductMetadata } from "~/server/setProductMetadata";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const byobOptions: ByobCustomizerOptions = await getBYOBOptions(admin);

  return json(byobOptions);
}


export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  const serializedData = await request.formData();

  const data: SerializedCustomizeForm = JSON.parse(serializedData.get("data"));

  // Note that order of operations matters. For example when updating prices and option names in the same form,
  // we update price variants using the old option names first, and then update the option names to the new values
  await updateVariants(admin, data.product.id, data.product.variants.nodes, data.productMetadata,
    data.sizeToPriceUpdates, data.flowerToPriceUpdates);

  if (data.optionToNameUpdates[FLOWER_OPTION_NAME] != null
    && data.productMetadata.optionToName[FLOWER_OPTION_NAME] != data.optionToNameUpdates[FLOWER_OPTION_NAME]) {
    await updateOptionName(admin, data.product, data.productMetadata.optionToName[FLOWER_OPTION_NAME], data.optionToNameUpdates[FLOWER_OPTION_NAME]);
  }

  if (data.optionToNameUpdates[PALETTE_OPTION_NAME] != null
    && data.productMetadata.optionToName[PALETTE_OPTION_NAME] != data.optionToNameUpdates[PALETTE_OPTION_NAME]) {
    await updateOptionName(admin, data.product, data.productMetadata.optionToName[PALETTE_OPTION_NAME], data.optionToNameUpdates[PALETTE_OPTION_NAME]);
  }

  if (data.optionToNameUpdates[SIZE_OPTION_NAME] != null
    && data.productMetadata.optionToName[SIZE_OPTION_NAME] != data.optionToNameUpdates[SIZE_OPTION_NAME]) {
    await updateOptionName(admin, data.product, data.productMetadata.optionToName[SIZE_OPTION_NAME], data.optionToNameUpdates[SIZE_OPTION_NAME]);
  }

  updateMap(data.productMetadata.sizeToPrice, data.sizeToPriceUpdates);
  updateMap(data.productMetadata.flowerToPrice, data.flowerToPriceUpdates);
  updateMap(data.productMetadata.optionToName, data.optionToNameUpdates);
  await setProductMetadata(admin, data.product.id,
      FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, JSON.stringify(data.productMetadata));

  return redirect(`/app`);
}

export function updateMap<T>(original: { [key:string]: T }, updates: { [key:string]: T }) {
  for (const optionValue in updates) {
      original[optionValue] = updates[optionValue];
  }
}

const createValueCustomizationsObject = (optionValues: string[], optionValueToPrice: { [key: string]: number }) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    acc[value] = {
      name: value,
      price: optionValueToPrice[value] != undefined ? optionValueToPrice[value] : 0, //todo: default prices
      connectedLeft: null
    };
    return acc;
  }, {});
};

const createPaletteValueCustomizationsObject = (availablePalettes: Palette[], optionValues: string[]) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    const palette = availablePalettes.find(palette => palette.name === value)

    acc[value] = {
      name: value,
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
  // const errors = useActionData()?.errors || {};

  const formOptions: ByobCustomizerOptions = useLoaderData();

  const form: BouquetCustomizationForm = {
    optionCustomizations: {
      [SIZE_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[SIZE_OPTION_NAME],
        optionValueCustomizations: createValueCustomizationsObject(formOptions.sizesSelected, formOptions.productMetadata.sizeToPrice),
      },
      [PALETTE_OPTION_NAME]: {
        optionName: formOptions.productMetadata.optionToName[PALETTE_OPTION_NAME],
        optionValueCustomizations: createPaletteValueCustomizationsObject(
          formOptions.palettesAvailable,
          formOptions.palettesSelected
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
    flowerToPriceUpdates: {}
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
      optionToNameUpdates: formState.optionToNameUpdates
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

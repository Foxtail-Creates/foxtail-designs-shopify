import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import {
  Card,
  Divider,
  Layout,
  Page,
  Text,
  TextField,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { PaletteSection } from "~/components/palettes/PaletteSection";
import { FocalFlowersSection } from "~/components/focal-flowers/FocalFlowersSection";
import { SizeSection } from "~/components/sizes/SizeSection";
import type {
  BouquetSettingsForm,
  ByobCustomizerOptions,
  SerializedSettingForm,
} from "~/types";
import { authenticate } from "../shopify.server";
import {
  FLOWER_OPTION_NAME,
  FLOWER_POSITION,
  PALETTE_OPTION_NAME,
  PALETTE_POSITION,
  SIZE_OPTION_NAME,
  SIZE_POSITION
} from "../constants";

import type { FormErrors } from "~/errors";
import { getBYOBOptions } from "~/server/getBYOBOptions";
import { updateOptionsAndCreateVariants } from "~/server/updateOptionsAndCreateVariants";
import { TwoWayFallbackMap } from "~/server/TwoWayFallbackMap";
import { CreateMediaInput, createProductMedia } from "~/server/createProductMedia";
import { deleteProductMedia } from "~/server/deleteProductMedia";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const byobOptions: ByobCustomizerOptions = await getBYOBOptions(admin);

  return json(byobOptions);
}

export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  const serializedData = await request.formData();
  const errors: FormErrors = {};

  const data: SerializedSettingForm = JSON.parse(serializedData.get("data"));

  if (data.flowersSelected.length == 0) {
    errors.flowers = "Invalid flower selection. Select at least one focal flower to offer to customers.";
  }
  if (data.sizesSelected.length == 0) {
    errors.sizes = "Invalid size selection. Select at least one size option to offer to customers.";
  }
  if (data.palettesSelected.length == 0) {
    errors.palettes = "Invalid palette selection. Select at least one palette option to offer to customers.";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[FLOWER_OPTION_NAME], FLOWER_POSITION, data.flowerOptionValuesToRemove, data.flowerOptionValuesToAdd,
    data.flowersSelected, (x) => x);
  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[SIZE_OPTION_NAME], SIZE_POSITION, data.sizeOptionValuesToRemove, data.sizeOptionValuesToAdd,
    data.sizesSelected, (sizeEnum) => TwoWayFallbackMap.getValue(sizeEnum, data.sizeEnumToName.customMap, data.sizeEnumToName.defaultMap));
  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[PALETTE_OPTION_NAME], PALETTE_POSITION, data.paletteOptionValuesToRemove, data.paletteOptionValuesToAdd,
    data.palettesSelected, (paletteId => TwoWayFallbackMap.getValue(paletteId, data.paletteBackendIdToName.customMap, data.paletteBackendIdToName.defaultMap)));

  // remove all images
  if (data.productImages?.length) {
    const mediaIds = data.productImages.map((image) =>
        image.id
      );

    console.log(mediaIds)
    console.log(data.product.id)

    await deleteProductMedia(admin, mediaIds, data.product.id);
  }

  // add images for palettes
  if (data.palettesSelected.length > 0) {
    const createMediaInput: CreateMediaInput[] = data.allPaletteColorOptions.filter(
      (palette) => data.palettesSelected.includes(palette.name),
    ).map((palette) => {
      return {
        alt: `Palette ${palette.name}`,
        originalSource: palette.imageLink,
        mediaContentType: "IMAGE"
      };
    });

    await createProductMedia(admin, createMediaInput, data.product.id);
    // todo: re-order media
    // todo: set media on variants
  }

  return redirect(`/app/bouquets/customize`);
}

export default function ByobCustomizationForm() {
  const errors: FormErrors = useActionData()?.errors || {};
  const byobCustomizer: ByobCustomizerOptions = useLoaderData();

  const byobCustomizerForm: BouquetSettingsForm = {
    destination: byobCustomizer.destination,
    productName: byobCustomizer.productName,
    prevSizesSelected: byobCustomizer.sizesSelected,
    sizesSelected: byobCustomizer.sizesSelected,
    allSizeOptions: byobCustomizer.sizesAvailable,
    sizeOptionValuesToAdd: [],
    sizeOptionValuesToRemove: [],
    sizeEnumToName: byobCustomizer.sizeEnumToName,
    allPaletteColorOptions: byobCustomizer.palettesAvailable.map(
      (palette) => palette.name,
    ),
    palettesSelected: byobCustomizer.palettesSelected,
    paletteOptionValuesToRemove: [],
    paletteOptionValuesToAdd: [],
    paletteBackendIdToName: byobCustomizer.paletteBackendIdToName,
    allFocalFlowerOptions: byobCustomizer.flowersAvailable.map(
      (flower) => flower.name,
    ),
    flowersSelected: byobCustomizer.flowersSelected,
    flowerOptionValuesToRemove: [],
    flowerOptionValuesToAdd: [],
    productMetadata: byobCustomizer.productMetadata
  };

  const [formState, setFormState] = useState(byobCustomizerForm);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting";

  const navigate = useNavigate();

  const submit = useSubmit();

  function submitFormData() {
    const data: SerializedSettingForm = {
      productName: formState.productName,
      product: byobCustomizer.customProduct,
      sizesSelected: formState.sizesSelected,
      sizeOptionValuesToAdd: formState.sizeOptionValuesToAdd,
      sizeOptionValuesToRemove: formState.sizeOptionValuesToRemove,
      sizeEnumToName: formState.sizeEnumToName,
      allPaletteColorOptions: byobCustomizer.palettesAvailable,
      palettesSelected: formState.palettesSelected,
      paletteOptionValuesToRemove: formState.paletteOptionValuesToRemove,
      paletteOptionValuesToAdd: formState.paletteOptionValuesToAdd,
      paletteBackendIdToName: formState.paletteBackendIdToName,
      allFocalFlowerOptions: formState.allFocalFlowerOptions,
      flowersSelected: formState.flowersSelected,
      flowerOptionValuesToRemove: formState.flowerOptionValuesToRemove,
      flowerOptionValuesToAdd: formState.flowerOptionValuesToAdd,
      productMetadata: byobCustomizer.productMetadata,
      productImages: byobCustomizer.productImages
    };

    const serializedData = JSON.stringify(data);

    submit({ data: serializedData }, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar
        title={byobCustomizer.productName !== "" ? "Edit Settings" : "Create New BYOB Product"}
      >
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          Home
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Product Name
                </Text>
                <TextField
                  id="title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  placeholder="Build Your Own Bouquet"
                  value={formState.productName}
                  onChange={(productName) =>
                    setFormState({ ...formState, productName })
                  }
                // error={errors.productName}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Customizations
                </Text>
                <Text as={"h3"} variant="bodyMd">
                  Choose which product options are available to a
                  customer. You can edit names and prices in the next page.
                </Text>
                <Divider />
                <SizeSection
                  allSizesAvailable={byobCustomizer.sizesAvailable}
                  formState={formState}
                  setFormState={setFormState}
                  errors={errors}
                />
                <Divider />
                <PaletteSection
                  allPaletteOptions={byobCustomizer.palettesAvailable}
                  formState={formState}
                  setFormState={setFormState}
                  errors={errors}
                />
                <Divider />
                <FocalFlowersSection
                  allFocalFlowerOptions={byobCustomizer.flowersAvailable.sort(
                    (a, b) => a.name.localeCompare(b.name),
                  )}
                  formState={formState}
                  setFormState={setFormState}
                  errors={errors}
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

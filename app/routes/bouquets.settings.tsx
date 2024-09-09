import { Suspense, useEffect, useRef, useState } from "react";
import { defer, json } from "@remix-run/node";
import {
  Await,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
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
  BannerHandles,
  Box,
  InlineGrid,
  useBreakpoints,
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
  HOME_PATH,
  PALETTE_OPTION_NAME,
  PALETTE_POSITION,
  PRODUCT_DESCRIPTION,
  PRODUCT_MAIN_IMAGE_SOURCE,
  PRODUCT_NAME,
  SIZE_OPTION_NAME,
  SIZE_POSITION
} from "../constants";

import type { FormErrors } from "~/errors";
import { getBYOBOptions } from "~/server/controllers/getBYOBOptions";
import { updateOptionsAndCreateVariants } from "~/server/controllers/updateOptionsAndCreateVariants";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { CreateMediaInput, createProductMedia } from "~/server/services/createProductMedia";
import { deleteProductMedia } from "~/server/services/deleteProductMedia";
import { UserErrorBanner } from "~/components/errors/UserErrorBanner";
import { ServerErrorBanner } from "~/components/errors/ServerErrorBanner";
import { captureException } from "@sentry/remix";
import { SettingsFormSkeleton } from "~/components/skeletons/SettingsFormSkeleton";
import { CustomizationsFormSkeleton } from "~/components/skeletons/CustomizationsFormSkeleton";
import { updateProduct } from "~/server/services/updateProduct";

export async function loader({ request }) {
  const byobOptions: ByobCustomizerOptions = getBYOBOptions(request);

  return defer({
    byobOptions,
  });
}

export async function action({ request }) {
  const { admin, redirect } = await authenticate.admin(request);
  try {
    const serializedData = await request.formData();

    const data: SerializedSettingForm = JSON.parse(serializedData.get("data"));

    if (data.productName != data.prevProductName || data.productDescription != data.prevProductDescription) {
      await updateProduct(admin, data.product.id, data.productName, data.productDescription);
    }
    await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[FLOWER_OPTION_NAME], FLOWER_POSITION, data.flowerOptionValuesToRemove, data.flowerOptionValuesToAdd,
      data.flowersSelected, (x) => x);
    await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[SIZE_OPTION_NAME], SIZE_POSITION, data.sizeOptionValuesToRemove, data.sizeOptionValuesToAdd,
      data.sizesSelected, (sizeEnum) => TwoWayFallbackMap.getValue(sizeEnum, data.sizeEnumToName.customMap, data.sizeEnumToName.defaultMap));
    await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[PALETTE_OPTION_NAME], PALETTE_POSITION, data.paletteOptionValuesToRemove, data.paletteOptionValuesToAdd,
      data.palettesSelected, (paletteId => TwoWayFallbackMap.getValue(paletteId, data.paletteBackendIdToName.customMap, data.paletteBackendIdToName.defaultMap)));

    const shouldUpdatePaletteImages = data.paletteOptionValuesToRemove.length > 0 || data.paletteOptionValuesToAdd.length > 0 || data.productImages?.length == 0;
    // delete all existing images
    if (data.productImages?.length && shouldUpdatePaletteImages) {
      const mediaIds = data.productImages.map((media) => media.id);
      await deleteProductMedia(admin, mediaIds, data.product.id);
    }

    // add new images for palette bouquets
    if (data.palettesSelected.length > 0 && shouldUpdatePaletteImages) {
      let createMediaInput: CreateMediaInput[] = data.allPaletteColorOptions.filter(
        (palette) => data.palettesSelected.includes(palette.id.toString()),
      ).map((palette) => {
        return {
          alt: `${palette.id}`,
          originalSource: palette.imageLink,
          mediaContentType: "IMAGE"
        };
      });

      // add main image for product as first image in list
      createMediaInput = [{
        alt: `Custom Order`,
        originalSource: PRODUCT_MAIN_IMAGE_SOURCE,
        mediaContentType: "IMAGE"
      }].concat(createMediaInput)

      await createProductMedia(admin, createMediaInput, data.product.id);
    }
    return redirect(`/bouquets/customize`);
  } catch (err) {
    console.error(err);
    captureException(err);
    return json({ backendError: true });
  }

}

type ByobSettingsFormProps = {
  byobCustomizer: ByobCustomizerOptions
  hasBackendError: boolean
  isSaving: boolean
}

const ByobSettingsForm = ({
  byobCustomizer,
  hasBackendError,
  isSaving
}: ByobSettingsFormProps) => {
  const byobCustomizerForm: BouquetSettingsForm = {
    destination: byobCustomizer.destination,
    prevProductName: byobCustomizer.productName,
    productName: byobCustomizer.productName,
    prevProductDescription: byobCustomizer.productDescription,
    productDescription: byobCustomizer.productDescription,
    prevSizesSelected: byobCustomizer.sizesSelected,
    sizesSelected: byobCustomizer.sizesSelected,
    allSizeOptions: byobCustomizer.sizesAvailable,
    sizeOptionValuesToAdd: [],
    sizeOptionValuesToRemove: [],
    sizeEnumToName: byobCustomizer.sizeEnumToName,
    allPaletteOptionsSorted: byobCustomizer.palettesAvailableSorted.map(
      (palette) => palette.name,
    ),
    palettesSelected: byobCustomizer.palettesSelected,
    paletteOptionValuesToRemove: [],
    paletteOptionValuesToAdd: [],
    paletteBackendIdToName: byobCustomizer.paletteBackendIdToName,
    allFlowerOptionsSorted: byobCustomizer.flowersAvailableSorted.map(
      (flower) => flower.name,
    ),
    flowersSelected: byobCustomizer.flowersSelected,
    flowerOptionValuesToRemove: [],
    flowerOptionValuesToAdd: [],
    productMetadata: byobCustomizer.productMetadata
  };

  const [userErrors, setUserErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState(byobCustomizerForm);

  const submit = useSubmit();

  const userErrorBanner = useRef<BannerHandles>(null);
  useEffect(() => userErrorBanner.current?.focus(), [userErrors]);

  const backendErrorBanner = useRef<BannerHandles>(null);
  useEffect(() => backendErrorBanner.current?.focus(), [hasBackendError]);

  function submitFormData(setUserErrors: React.Dispatch<React.SetStateAction<FormErrors>>) {
    const data: SerializedSettingForm = {
      prevProductName: formState.prevProductName,
      productName: formState.productName,
      prevProductDescription: formState.prevProductDescription,
      productDescription: formState.productDescription,
      product: byobCustomizer.customProduct,
      sizesSelected: formState.sizesSelected,
      sizeOptionValuesToAdd: formState.sizeOptionValuesToAdd,
      sizeOptionValuesToRemove: formState.sizeOptionValuesToRemove,
      sizeEnumToName: formState.sizeEnumToName,
      allPaletteColorOptions: byobCustomizer.palettesAvailableSorted,
      palettesSelected: formState.palettesSelected,
      paletteOptionValuesToRemove: formState.paletteOptionValuesToRemove,
      paletteOptionValuesToAdd: formState.paletteOptionValuesToAdd,
      paletteBackendIdToName: formState.paletteBackendIdToName,
      allFocalFlowerOptions: formState.allFlowerOptionsSorted,
      flowersSelected: formState.flowersSelected,
      flowerOptionValuesToRemove: formState.flowerOptionValuesToRemove,
      flowerOptionValuesToAdd: formState.flowerOptionValuesToAdd,
      productMetadata: byobCustomizer.productMetadata,
      productImages: byobCustomizer.productImages
    };

    const userErrors: FormErrors = {};

    if (data.flowersSelected.length == 0) {
      userErrors.flowers = "No flowers selected. Select at least one focal flower to offer to customers.";
    }
    if (data.flowersSelected.length > 5) {
      userErrors.flowers = "More than 5 flower options selected. Please select 5 or fewer options.";
    }
    if (data.sizesSelected.length == 0) {
      userErrors.sizes = "No sizes selected. Select at least one size option to offer to customers.";
    }
    if (data.palettesSelected.length == 0) {
      userErrors.palettes = "No palettes selected. Select at least one palette option to offer to customers.";
    }
    if (data.palettesSelected.length > 5) {
      userErrors.palettes = "More than 5 palette options selected. Please select 5 or fewer options.";
    }

    setUserErrors(userErrors);

    if (hasBackendError || Object.keys(userErrors).length > 0) {
      return;
    }
    const serializedData = JSON.stringify(data);
    submit({ data: serializedData }, { method: "post" });
  }

  const { smUp } = useBreakpoints();

  return (
    <Page
      backAction={{ content: 'Home', url: HOME_PATH }}
      title={byobCustomizer.productName !== "" ? "Edit" : "Create"}
      subtitle={byobCustomizer.productName !== "" ? "Edit your Build-Your-Own-Bouquet Product" : "Create a new Build-Your-Own-Bouquet Product"}
      compactTitle
      pagination={{
        hasNext: true,
        onNext: () => submitFormData(setUserErrors),
      }}
    >
      <Layout>
        {(hasBackendError) && <Layout.Section>
          <ServerErrorBanner banner={backendErrorBanner} />
        </Layout.Section>
        }
        {(!hasBackendError && Object.keys(userErrors).length > 0) && <Layout.Section>
          <UserErrorBanner errors={userErrors} banner={userErrorBanner} setUserErrors={setUserErrors} />
        </Layout.Section>
        }
        <Layout.Section>
          <BlockStack gap={{ xs: "800", sm: "400" }}>
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Product customizations
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <TextField
                    id="title"
                    label="Product Name"
                    autoComplete="off"
                    placeholder={PRODUCT_NAME}
                    value={formState.productName}
                    onChange={(productName) =>
                      setFormState({ ...formState, productName })
                    }
                  />
                  <TextField
                    id="description"
                    label="Product Description"
                    helpText="Supports HTML formatting"
                    autoComplete="off"
                    placeholder={PRODUCT_DESCRIPTION}
                    multiline={4}
                    value={formState.productDescription}
                    onChange={(productDescription) =>
                      setFormState({ ...formState, productDescription })
                    }
                  />
                </BlockStack>
              </Card>
            </InlineGrid>
            {smUp ? <Divider /> : null}
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Size Customizations
                  </Text>
                  <Text as={"h3"} variant="bodyMd">
                    Choose what bouquet sizes you want to offer to your customers.
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <SizeSection
                  allSizesAvailable={byobCustomizer.sizesAvailable}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
                />
              </Card>
            </InlineGrid>
            {smUp ? <Divider /> : null}
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Palette Customizations
                  </Text>
                  <Text as={"h3"} variant="bodyMd">
                  Choose up to five (5) color palettes you want to offer to your customers.
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <PaletteSection
                  allPaletteOptionsSorted={byobCustomizer.palettesAvailableSorted}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
                />
              </Card>
            </InlineGrid>
            {smUp ? <Divider /> : null}
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Main Flower Customizations
                  </Text>
                  <Text as={"h3"} variant="bodyMd">
                  Choose up to five (5) main flowers you want to offer. Your customers will choose one (1) main flower for their bouquet. 
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <FocalFlowersSection
                  allFlowerOptionsSorted={byobCustomizer.flowersAvailableSorted}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
                />
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save and continue",
              loading: isSaving,
              disabled: isSaving,
              onAction: () => { submitFormData(setUserErrors) },
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function LoadingSettingsForm() {
  const { byobOptions } = useLoaderData<typeof loader>();
  const backendError: boolean = useActionData()?.backendError || false;
  const nav = useNavigation();

  const isSaving =
    (nav.state === "submitting" || nav.state === "loading") && nav.location.pathname != HOME_PATH;
  return (
    <>
      {isSaving && <CustomizationsFormSkeleton />}
      {!isSaving && (
        <Suspense fallback={<SettingsFormSkeleton />}>
          <Await resolve={byobOptions} >
            {
              (byobOptions) =>
                <ByobSettingsForm
                  byobCustomizer={byobOptions}
                  backendError={backendError}
                  isSaving={isSaving}
                />
            }
          </Await>
        </Suspense>
      )}
    </>
  )
}

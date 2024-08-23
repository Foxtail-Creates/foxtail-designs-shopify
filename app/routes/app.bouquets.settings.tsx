import { Suspense, useEffect, useRef, useState } from "react";
import { defer, redirect } from "@remix-run/node";
import {
  Await,
  SubmitFunction,
  useAsyncValue,
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
  SkeletonBodyText,
  SkeletonPage,
  SkeletonDisplayText,
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
  PRODUCT_MAIN_IMAGE_SOURCE,
  SIZE_OPTION_NAME,
  SIZE_POSITION
} from "../constants";

import type { FormErrors } from "~/errors";
import { getBYOBOptions } from "~/server/controllers/getBYOBOptions";
import { updateOptionsAndCreateVariants } from "~/server/controllers/updateOptionsAndCreateVariants";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { CreateMediaInput, createProductMedia } from "~/server/services/createProductMedia";
import { deleteProductMedia } from "~/server/services/deleteProductMedia";
import { ErrorBanner } from "~/components/errors/ErrorBanner";

export async function loader({ request }) {
  const byobOptions = getBYOBOptions(request);
  return defer({ byobOptions });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const serializedData = await request.formData();

  const data: SerializedSettingForm = JSON.parse(serializedData.get("data"));

  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[FLOWER_OPTION_NAME], FLOWER_POSITION, data.flowerOptionValuesToRemove, data.flowerOptionValuesToAdd,
    data.flowersSelected, (x) => x);
  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[SIZE_OPTION_NAME], SIZE_POSITION, data.sizeOptionValuesToRemove, data.sizeOptionValuesToAdd,
    data.sizesSelected, (sizeEnum) => TwoWayFallbackMap.getValue(sizeEnum, data.sizeEnumToName.customMap, data.sizeEnumToName.defaultMap));
  await updateOptionsAndCreateVariants(admin, data.product, data.productMetadata.optionToName[PALETTE_OPTION_NAME], PALETTE_POSITION, data.paletteOptionValuesToRemove, data.paletteOptionValuesToAdd,
    data.palettesSelected, (paletteId => TwoWayFallbackMap.getValue(paletteId, data.paletteBackendIdToName.customMap, data.paletteBackendIdToName.defaultMap)));

  const shouldUpdatePaletteImages = data.paletteOptionValuesToRemove.length > 0 || data.paletteOptionValuesToAdd.length > 0
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

  return redirect(`/app/bouquets/customize`);
}

const Skeleton = () => {
  return (
    <SkeletonPage title="Edit" primaryAction backAction>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Product Name
                </Text>
                <SkeletonDisplayText size="small" />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Customizations
                </Text>
                <SkeletonBodyText lines={1} />
                <Divider />
                <Text as={"h3"} variant="headingMd">
                  Size options
                </Text>
                <SkeletonBodyText lines={1} />
                <SkeletonDisplayText size="small" />
                <Divider />
                <Text as={"h3"} variant="headingMd">
                  Palette Color Options
                </Text>
                <SkeletonBodyText lines={1} />
                <SkeletonDisplayText size="small" />
                <Divider />
                <Text as={"h3"} variant="headingMd">
                  Main flower options
                </Text>
                <SkeletonBodyText lines={1} />
                <SkeletonDisplayText size="small" />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

type SettingsFormProps = {
  setFormState: React.Dispatch<React.SetStateAction<BouquetSettingsForm | undefined>>;
  banner: React.RefObject<BannerHandles>;
  errors: FormErrors;
  formState: BouquetSettingsForm | undefined;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  submitFormData: (
    formState: BouquetSettingsForm,
    byobCustomizer: ByobCustomizerOptions,
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  ) => void;
  isSaving: boolean;
}

const SettingsForm = ({
  banner,
  errors,
  formState,
  setFormState,
  setErrors,
  submitFormData,
  isSaving,
}: SettingsFormProps) => {
  const byobCustomizer: ByobCustomizerOptions = useAsyncValue();
  const byobCustomizerForm: BouquetSettingsForm = {
    destination: byobCustomizer.destination,
    productName: byobCustomizer.productName,
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

  setFormState(byobCustomizerForm);

  return (
    <>
      {formState && (
        <Page
          backAction={{ content: 'Home', url: '/app' }}
          title={formState.productName !== "" ? "Edit" : "Create"}
          subtitle={formState.productName !== "" ? "Edit your Build-Your-Own-Bouquet Product" : "Create a new Build-Your-Own-Bouquet Product"}
          compactTitle
          pagination={{
            hasNext: true,
            onNext: () => submitFormData(formState, byobCustomizer, setErrors),
          }}
        >
          <Layout>
            {(Object.keys(errors).length > 0) && <Layout.Section>
              <ErrorBanner errors={errors} banner={banner} setErrors={setErrors} />
            </Layout.Section>
            }
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
                      allPaletteOptionsSorted={byobCustomizer.palettesAvailableSorted}
                      formState={formState}
                      setFormState={setFormState}
                      errors={errors}
                    />
                    <Divider />
                    <FocalFlowersSection
                      allFlowerOptionsSorted={byobCustomizer.flowersAvailableSorted}
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
                  onAction: () => { submitFormData(formState, byobCustomizer, setErrors) },
                }}
              />
            </Layout.Section>
          </Layout>
        </Page>
      )}
    </>
  )
}

export default function ByobCustomizationForm() {
  const { byobOptions } = useLoaderData<typeof loader>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<BouquetSettingsForm>();

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" || nav.state === "loading";

  const submit = useSubmit();

  const banner = useRef<BannerHandles>(null);

  useEffect(() => banner.current?.focus(), [errors]);

  function submitFormData(
    formState: BouquetSettingsForm,
    byobCustomizer: ByobCustomizerOptions,
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  ) {
    const data: SerializedSettingForm = {
      productName: formState.productName,
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

    const errors: FormErrors = {};

    if (data.flowersSelected.length == 0) {
      errors.flowers = "No flowers selected. Select at least one focal flower to offer to customers.";
    }
    if (data.flowersSelected.length > 5) {
      errors.flowers = "More than 5 flower options selected. Please select 5 or fewer options.";
    }
    if (data.sizesSelected.length == 0) {
      errors.sizes = "No sizes selected. Select at least one size option to offer to customers.";
    }
    if (data.palettesSelected.length == 0) {
      errors.palettes = "No palettes selected. Select at least one palette option to offer to customers.";
    }
    if (data.palettesSelected.length > 5) {
      errors.palettes = "More than 5 palette options selected. Please select 5 or fewer options.";
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const serializedData = JSON.stringify(data);
    submit({ data: serializedData }, { method: "post" });
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <Await resolve={byobOptions}>
        <SettingsForm
          banner={banner}
          errors={errors}
          setErrors={setErrors}
          submitFormData={submitFormData}
          isSaving={isSaving}
          setFormState={setFormState}
          formState={formState}
        />
      </Await>
    </Suspense>
  );
}

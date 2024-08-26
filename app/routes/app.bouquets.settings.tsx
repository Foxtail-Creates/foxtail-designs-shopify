import { Suspense, useEffect, useRef, useState } from "react";
import { defer, json, redirect } from "@remix-run/node";
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
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
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
import { UserErrorBanner } from "~/components/errors/UserErrorBanner";
import { ServerErrorBanner } from "~/components/errors/ServerErrorBanner";
import { captureException } from "@sentry/remix";

export async function loader({ request }) {
  const byobOptions: ByobCustomizerOptions = getBYOBOptions(request);

  return defer({
    byobOptions,
  });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  try {
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
  } catch (err) {
    console.error(err);
    captureException(err);
    return json({ backendError: true });
  }

}

type ByobSettingsFormProps = {
  byobCustomizer: ByobCustomizerOptions
  backendError: boolean
}

const ByobSettingsForm = ({
  byobCustomizer,
  backendError
}: ByobSettingsFormProps) => {
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

  const [userErrors, setUserErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState(byobCustomizerForm);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" || nav.state === "loading";

  const submit = useSubmit();

  const userErrorBanner = useRef<BannerHandles>(null);
  useEffect(() => userErrorBanner.current?.focus(), [userErrors]);

  const backendErrorBanner = useRef<BannerHandles>(null);
  useEffect(() => backendErrorBanner.current?.focus(), [backendError]);

  function submitFormData(setUserErrors: React.Dispatch<React.SetStateAction<FormErrors>>) {
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

    if (backendError || Object.keys(userErrors).length > 0) {
      return;
    }
    const serializedData = JSON.stringify(data);
    submit({ data: serializedData }, { method: "post" });
  }

  return (
    <Page
      backAction={{ content: 'Home', url: '/app' }}
      title={byobCustomizer.productName !== "" ? "Edit" : "Create"}
      subtitle={byobCustomizer.productName !== "" ? "Edit your Build-Your-Own-Bouquet Product" : "Create a new Build-Your-Own-Bouquet Product"}
      compactTitle
      pagination={{
        hasNext: true,
        onNext: () => submitFormData(setUserErrors),
      }}
    >
      <Layout>
        {(backendError) && <Layout.Section>
          <ServerErrorBanner banner={backendErrorBanner} />
        </Layout.Section>
        }
        {(!backendError && Object.keys(userErrors).length > 0) && <Layout.Section>
          <UserErrorBanner errors={userErrors} banner={userErrorBanner} setUserErrors={setUserErrors} />
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
                  Choose which product options are available to your
                  customer.
                </Text>
                <Divider />
                <SizeSection
                  allSizesAvailable={byobCustomizer.sizesAvailable}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
                />
                <Divider />
                <PaletteSection
                  allPaletteOptionsSorted={byobCustomizer.palettesAvailableSorted}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
                />
                <Divider />
                <FocalFlowersSection
                  allFlowerOptionsSorted={byobCustomizer.flowersAvailableSorted}
                  formState={formState}
                  setFormState={setFormState}
                  errors={userErrors}
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
              onAction: () => { submitFormData(setUserErrors) },
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
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

export default function LoadingSettingsForm() {
  const { byobOptions } = useLoaderData<typeof loader>();
  const backendError: boolean = useActionData()?.backendError || false;
  return (
    <Suspense fallback={<Skeleton />}>
      <Await resolve={byobOptions} >
        {
          (byobOptions) =>
            <ByobSettingsForm
              byobCustomizer={byobOptions}
              backendError={backendError}
            />
        }
      </Await>
    </Suspense>
  )
}

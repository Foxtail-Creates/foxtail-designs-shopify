import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
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
  ByobCustomizerForm,
  ByobCustomizerOptions,
  SerializedForm,
} from "~/types";

import {
  FLOWER_OPTION_NAME,
  FLOWER_POSITION
} from "../constants";

import {
  UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY
} from "../server/graphql";

import { FormErrors } from "~/errors";
import { getBYOBOptions } from "~/server/getBYOBOptions";
import { createProductOptions } from "~/server/createProductOptions";
import invariant from "tiny-invariant";


export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const byobOptions: ByobCustomizerOptions = await getBYOBOptions(admin);

  return json(byobOptions);
}

export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  const serializedData = await request.formData();
  const errors: FormErrors = {};

  const data: SerializedForm = JSON.parse(serializedData.get("data"));

  if (data.flowersSelected.length == 0) {
    errors.flowers = "Invalid flower selection. Select at least one focal flower to offer to customers.";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }
  // todo: delete if data.action == "delete"
  // if (data.action === "delete") {
  //   return json({ message: "Delete is not implemented" }, { status: 500 });
  // }

  const flowerOption = data.product.options.find(
    (option) => option.name === FLOWER_OPTION_NAME,
  );

  const optionValueNameToId: Map<string, string> = flowerOption
    ? flowerOption.optionValues.reduce(function (map, optionValue) {
      map.set(optionValue.name, optionValue.id);
      return map;
    }, new Map<string, string>())
    : new Map<string, string>();

  const valueIdsToRemove: string[] = [];
  const flowerOptionValuesToRemove: string[] = data.flowerOptionValuesToRemove;

  flowerOptionValuesToRemove.forEach((flowerName: string) => {
    if (optionValueNameToId.has(flowerName)) {
      valueIdsToRemove.push(optionValueNameToId.get(flowerName));
    }
  });

  if (flowerOption == null && data.flowersSelected.length > 0) {
    // if flower option is missing, recover by creating a new option and variants from all flowers selected
    createProductOptions(admin, data.product.id, FLOWER_POSITION, FLOWER_OPTION_NAME, data.flowersSelected);
  } else if (
    flowerOption != undefined &&
    flowerOptionValuesToRemove.length > 0 ||
    data.flowerOptionValuesToAdd.length > 0
  ) {
    const updateProductOptionAndVariantsResponse = await admin.graphql(
      UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
      {
        variables: {
          productId: data.product.id,
          optionId: flowerOption.id,
          newValues:  data.flowerOptionValuesToAdd.map(
            (flowerName: string) => ({ name: flowerName })
          ),
          oldValues: valueIdsToRemove,
        },
      },
    );

    // todo: validation

    const updateProductOptionBody = await updateProductOptionAndVariantsResponse.json();
    invariant(updateProductOptionBody.data?.productOptionUpdate?.userErrors.length == 0,
      "Error creating new product options. Contact Support for help."
    );
  }

  return redirect(`/app/bouquets/customize`);
}

export default function ByobCustomizationForm() {
  const errors: FormErrors = useActionData()?.errors || {};
  const byobCustomizer: ByobCustomizerOptions = useLoaderData();
  const byobCustomizerForm: ByobCustomizerForm = {
    destination: byobCustomizer.destination,
    productName: byobCustomizer.productName,
    sizeOptions: byobCustomizer.sizeOptions,
    allPaletteColorOptions: byobCustomizer.palettesAvailable.map(
      (palette) => palette.name,
    ),
    allFocalFlowerOptions: byobCustomizer.flowersAvailable.map(
      (flower) => flower.name,
    ),
    flowersSelected: byobCustomizer.flowersSelected,
    flowerOptionValuesToRemove: [],
    flowerOptionValuesToAdd: [],
  };

  const [formState, setFormState] = useState(byobCustomizerForm);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();

  function submitFormData() {
    const data: SerializedForm = {
      productName: formState.productName,
      product: byobCustomizer.customProduct,
      sizeOptions: formState.sizeOptions,
      allPaletteColorOptions: formState.allPaletteColorOptions,
      allFocalFlowerOptions: formState.allFocalFlowerOptions,
      flowersSelected: formState.flowersSelected,
      flowerOptionValuesToRemove: formState.flowerOptionValuesToRemove,
      flowerOptionValuesToAdd: formState.flowerOptionValuesToAdd,
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
                  value={formState.productName}
                  onChange={(productName) =>
                    setFormState({ ...formState, productName })
                  }
                  error={errors.productName}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Customizations
                </Text>
                <Text as={"h3"} variant="bodyMd">
                  Choose which product customizations are available to a
                  customer. You can edit names and prices in the next page.
                </Text>
                <Divider />
                <SizeSection
                  allSizeOptions={byobCustomizer.sizeOptions}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <PaletteSection
                  allPaletteOptions={byobCustomizer.palettesAvailable}
                  formState={formState}
                  setFormState={setFormState}
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
              content: "Save and Continue",
              loading: isSaving,
              disabled: isSaving || isDeleting,
              onAction: submitFormData,
            }}
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled:
                  !byobCustomizer.productName ||
                  !byobCustomizer ||
                  isSaving ||
                  isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

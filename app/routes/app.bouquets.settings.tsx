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
  createStoreOptions,
  type StoreOptions,
} from "~/models/StoreSetting.server";

import {
  FLOWER_OPTION_NAME,
  FLOWER_POSITION,
  FOXTAIL_NAMESPACE,
  PRODUCT_METADATA_SELECTED_OPTIONS,
  STORE_METADATA_CUSTOM_PRODUCT_KEY,
} from "./constants";
import {
  GET_SHOP_METAFIELD_QUERY,
  SET_NEW_SHOP_METADATA_QUERY,
} from "./graphql/shopQueries";
import {
  GET_CUSTOM_PRODUCT_QUERY,
  CREATE_NEW_CUSTOM_PRODUCT_QUERY,
} from "./graphql/productQueries";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS } from "./graphql/productOptionQueries";
import { FormErrors } from "~/errors";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  let shop,
    product,
    palettesSelected = [],
    flowersSelected = [];

  // find existing shop metadata if it exists
  const getShopMetadataResponse = await admin.graphql(
    GET_SHOP_METAFIELD_QUERY,
    {
      variables: {
        namespace: FOXTAIL_NAMESPACE,
        key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
      },
    },
  );
  ({
    data: { shop },
  } = await getShopMetadataResponse.json());

  // get all possible store options
  const allCustomOptions: StoreOptions = await createStoreOptions();

  if (shop.metafield != null && shop.metafield.value != null) {
    // if custom product already exists, retrieve it

    const customProductResponse = await admin.graphql(
      GET_CUSTOM_PRODUCT_QUERY,
      {
        variables: {
          id: shop.metafield.value,
        },
      },
    );
    ({
      data: { product },
    } = await customProductResponse.json());

    const flowerOption = product.options.find(
      (option) => option.name === FLOWER_OPTION_NAME,
    );

    // TODO: handle case where flowerOption is null, (i.e. custom product exists but does not have "Focal Flower" as an option)
    flowersSelected = flowerOption ? flowerOption.optionValues.map(
      (optionValue) => optionValue.name,
    ) : [];
  } else {
    // otherwise create new custom product and add to store metadata
    const [firstFlower, rest] = allCustomOptions.flowersAvailable;
    flowersSelected = firstFlower != null ? [{ name: firstFlower.name }] : [];
    const customProductResponse = await admin.graphql(
      CREATE_NEW_CUSTOM_PRODUCT_QUERY,
      {
        variables: {
          productName: "Custom Bouquet",
          productType: "Custom Flowers",
          flowerOptionName: FLOWER_OPTION_NAME,
          flowerPosition: FLOWER_POSITION,
          flowerValues: flowersSelected,
        },
      },
    );

    ({
      data: {
        productCreate: { product },
      },
    } = await customProductResponse.json());

    // set shop metafield to point to new custom product id
    const setStoreMetafieldResponse = await admin.graphql(
      SET_NEW_SHOP_METADATA_QUERY,
      {
        variables: {
          shopId: shop.id,
          productId: product.id,
          namespace: FOXTAIL_NAMESPACE,
          key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
        },
      },
    );
    const {
      data: {
        metafieldsSet: { userErrors },
      },
    } = await setStoreMetafieldResponse.json();
    if (userErrors != null) {
      return json({ userErrors }, { status: 422 });
    }
  }

  return json({
    destination: "product",
    productName: "",
    customProduct: product,
    sizeOptions: ["Small", "Medium", "Large", "Extra-Large"],
    palettesAvailable: allCustomOptions.palettesAvailable,
    flowersAvailable: allCustomOptions.flowersAvailable,
    palettesSelected: palettesSelected,
    flowersSelected: flowersSelected
  });
}

export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;

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

  const flowerOptionValuesToAdd = data.flowerOptionValuesToAdd.map(
    (flowerName: string) => ({ name: flowerName }),
  );

  // TODO: Fix handling when flowerOption is null
  if (
    flowerOption != undefined &&
    flowerOptionValuesToRemove.length > 0 ||
    flowerOptionValuesToAdd.length > 0
  ) {
    const updateProductOptionsAndVariantsResponse = await admin.graphql(
      UPDATE_PRODUCT_OPTION_AND_VARIANTS,
      {
        variables: {
          productId: data.product.id,
          optionId: flowerOption.id,
          newValues: flowerOptionValuesToAdd,
          oldValues: valueIdsToRemove,
        },
      },
    );

    // todo: validation

    const {
      data: { product, userErrors },
    } = await updateProductOptionsAndVariantsResponse.json();
    if (userErrors != null) {
      return json({ userErrors }, { status: 422 });
    }
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

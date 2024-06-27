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
import type { ByobCustomizerForm, ByobCustomizerOptions } from "~/types";

import {
  createStoreOptions,
  type StoreOptions,
} from "~/models/StoreSetting.server";

import type { Flower, Palette } from "@prisma/client";
import { FOXTAIL_NAMESPACE, PRODUCT_METADATA_SELECTED_OPTIONS, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "./constants";
import { GET_SHOP_METAFIELD_QUERY, SET_NEW_SHOP_METADATA_QUERY } from "./graphql/shopQueries";
import { GET_CUSTOM_PRODUCT_QUERY, SET_PRODUCT_METAFIELD_QUERY, CREATE_NEW_CUSTOM_PRODUCT_QUERY } from "./graphql/productQueries";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  let shop, product, palettesSelected = [], flowersSelected = [];

  // find existing shop metadata if it exists
  const getShopMetadataResponse = await admin.graphql(GET_SHOP_METAFIELD_QUERY,
      {
        variables: {
          namespace: FOXTAIL_NAMESPACE,
          key: STORE_METADATA_CUSTOM_PRODUCT_KEY
        }
      }
  );

  ({ data: { shop }} = await getShopMetadataResponse.json());
  
  // get all possible store options
  var allCustomOptions: StoreOptions = await createStoreOptions();

  var customProductId: String;

  if (shop.metafield != null && shop.metafield.value != null) {
    // if custom product already exists, retrieve it 

    customProductId = shop.metafield.value;
    const customProductResponse = await admin.graphql(GET_CUSTOM_PRODUCT_QUERY,
      { 
        variables: {
          id: customProductId,
          variantCount: 100,
          namespace: FOXTAIL_NAMESPACE,
          key: PRODUCT_METADATA_SELECTED_OPTIONS
        }
      }
    );
    ({
      data: { product },
    } = await customProductResponse.json());

    if (product.metafield != null && product.metafield.value != null) {
      ({flowersSelected} = JSON.parse(product.metafield.value));
    }

  } else {
    // otherwise create new custom product and add to store metadata
    const customProductResponse = await admin.graphql(CREATE_NEW_CUSTOM_PRODUCT_QUERY,
      { 
        variables: { 
          productName: "Custom Bouquet",
          productType: "Custom Flowers",
          variantCount: 10,
        },
      },
    );

    ({
      data: {
        productCreate: { product },
      },
    } = await customProductResponse.json());
    customProductId = product.id;

    // set shop metafield to point to new custom product id 
    const setStoreMetafieldResponse = await admin.graphql(SET_NEW_SHOP_METADATA_QUERY,
      { 
        variables: { 
          shopId: shop.id,
          productId: customProductId,
          namespace: FOXTAIL_NAMESPACE,
          key: STORE_METADATA_CUSTOM_PRODUCT_KEY
        },
      },
    );
    const {
      data: { userErrors },
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

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  // todo: delete if data.action == "delete"
  if (data.action === "delete") {
    return(json({message: "Delete is not implemented"}, {status: 500}));
  }

  // todo: validation 

  const selection = JSON.stringify({flowersSelected: data.focalFlowerOptions});
  // set new product metadata
  const setStoreMetafieldResponse = await admin.graphql(SET_PRODUCT_METAFIELD_QUERY,
    { 
      variables: { 
        productId: data.productId,
        value: selection,
        namespace: FOXTAIL_NAMESPACE,
        key: PRODUCT_METADATA_SELECTED_OPTIONS
      }
    }
  );

  return redirect(`/app/additional`);
}

export default function ByobCustomizationForm() {
  const errors = useActionData()?.errors || {};

  const byobCustomizer: ByobCustomizerOptions = useLoaderData();
  const byobCustomizerForm: ByobCustomizerForm = {
    destination: byobCustomizer.destination,
    productName: byobCustomizer.productName,
    sizeOptions: byobCustomizer.sizeOptions,
    paletteColorOptions: byobCustomizer.palettesAvailable.map(
      (palette) => palette.name,
    ),
    focalFlowerOptions: byobCustomizer.flowersAvailable.map(
      (flower) => flower.name,
    ),
    focalFlowerSelection: byobCustomizer.flowersSelected
  };

  const [formState, setFormState] = useState(byobCustomizerForm);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  // TODO: https://linear.app/foxtail-creates/issue/FOX-33/save-flower
  // TODO: https://linear.app/foxtail-creates/issue/FOX-35/shopify-app-frontend-edit-preset-names-and-descriptions
  // TODO: https://linear.app/foxtail-creates/issue/FOX-30/shopify-app-frontend-pricing
  function handleSaveAndNavigate() {
    const data = {
      productName: formState.productName,
      productId: byobCustomizer.customProduct.id,
      sizeOptions: formState.sizeOptions,
      paletteColorOptions: formState.paletteColorOptions,
      focalFlowerOptions: formState.focalFlowerOptions,
    };

    console.log("Saving form state: ", formState);
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar
        title={byobCustomizer.productName !== "" ? "Edit" : "Create"}
      >
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          BYOB Products
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
                  allPaletteOptions={byobCustomizer.palettesAvailable.concat(
                    byobCustomizer.palettesExcluded,
                  )}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <FocalFlowersSection
                  allFocalFlowerOptions={byobCustomizer.flowersAvailable
                    .sort((a, b) => a.name.localeCompare(b.name))}
                  formState={formState}
                  setFormState={setFormState}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
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
            primaryAction={{
              content: "Save and Continue",
              loading: isSaving,
              disabled: isSaving || isDeleting,
              onAction: handleSaveAndNavigate,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

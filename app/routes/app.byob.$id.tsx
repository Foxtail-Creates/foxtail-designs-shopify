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
import { type ByobCustomizerForm, type ByobCustomizerOptions } from "~/types";

import {
  FOCAL_FLOWER_OPTIONS_KEY,
  PALETTE_OPTIONS_KEY,
  PRODUCT_NAME_KEY,
  SIZE_OPTIONS_KEY,
} from "~/constants";

import {
  createStoreOptions,
  type StoreOptions,
} from "~/models/StoreSetting.server";

import type { Flower, Palette } from "@prisma/client";
import { FOXTAIL_NAMESPACE, CUSTOM_PRODUCT_KEY } from "./constants";

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData: FormData = await request.formData();

  const data: ByobCustomizerForm = {
    destination: "product",
    productName: formData.get(PRODUCT_NAME_KEY) as string,
    sizeOptions: formData.getAll(SIZE_OPTIONS_KEY) as string[],
    paletteColorOptions: formData.getAll(PALETTE_OPTIONS_KEY) as string[],
    focalFlowerOptions: formData.getAll(FOCAL_FLOWER_OPTIONS_KEY) as string[],
  };

  console.log(data);

  return redirect(`/app/byob/new`);
}

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  let shop, product;

  // find existing shop metadata if it exists
  const getShopMetadataResponse = await admin.graphql(
    ` #graphql
      query shopInfo($namespace: String!, $key: String!) {
        shop {
          metafield (namespace: $namespace, key: $key) {
            id,
            value
          }
          id
        }
      }`,
    {
      variables: {
        namespace: FOXTAIL_NAMESPACE,
        key: CUSTOM_PRODUCT_KEY,
      },
    },
  );

  ({
    data: { shop },
  } = await getShopMetadataResponse.json());

  // get all possible store options
  var allCustomOptions: StoreOptions = await createStoreOptions();

  var customProductId: String;

  if (shop.metafield != null && shop.metafield.value != null) {
    // if custom product already exists, retrieve it

    customProductId = shop.metafield.value;
    const customProductResponse = await admin.graphql(
      ` #graphql
          query getCustomProduct($id: ID!, $variantCount: Int!) { 
            product(id:$id) {
              id
              options {
                id
                optionValues {
                  name
                }
              }
              variantsCount {
                count
              }
              variants(first:$variantCount) {
                nodes {
                  displayName
                  id            
                }
              }
            }
        }`,
      {
        variables: {
          id: customProductId,
          variantCount: 100,
        },
      },
    );
    ({
      data: { product },
    } = await customProductResponse.json());
  } else {
    // otherwise create new custom product and add to store metadata
    const customProductResponse = await admin.graphql(
      ` #graphql
        mutation createNewCustomProduct($productName: String!, $productType: String!, $variantCount: Int!) {
          productCreate(
            input: {title: $productName, productType: $productType, status: DRAFT}
          ) {
            product {
              id
              options {
                id
                optionValues {
                  name
                }
              }
              variantsCount {
                count
              }
              variants(first: $variantCount) {
                nodes {
                  displayName
                  id
                }
              }
            }
            userErrors {
              message
            }
          }
      }`,
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
    const setStoreMetafieldResponse = await admin.graphql(
      ` #graphql
        mutation setNewMetafield($shopId: ID!, $productId: String!, $namespace: String!, $key: String!) {
          metafieldsSet(
            metafields: [{ownerId: $shopId, namespace: $namespace, key: $key, type: "string", value: $productId}]
          ) {
            userErrors {
              message
            }
          }
      }`,
      {
        variables: {
          shopId: shop.id,
          productId: customProductId,
          namespace: FOXTAIL_NAMESPACE,
          key: CUSTOM_PRODUCT_KEY,
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
    title: "",
    productName: "",
    customProduct: product,
    sizeOptions: ["Small", "Medium", "Large", "Extra-Large"],
    palettesAvailable: allCustomOptions.palettesAvailable,
    palettesExcluded: allCustomOptions.palettesExcluded,
    flowersAvailable: allCustomOptions.flowersAvailable,
    flowersExcluded: allCustomOptions.flowersExcluded,
  });
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
  function submitFormData() {
    const data = new FormData();

    data.set(PRODUCT_NAME_KEY, formState.productName);

    formState.paletteColorOptions.forEach((palette) => {
      data.append(PALETTE_OPTIONS_KEY, palette);
    });
    formState.sizeOptions.forEach((size) => {
      data.append(SIZE_OPTIONS_KEY, size);
    });
    formState.focalFlowerOptions.forEach((flower) => {
      data.append(FOCAL_FLOWER_OPTIONS_KEY, flower);
    });

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
                  allFocalFlowerOptions={byobCustomizer.flowersAvailable.concat(
                    byobCustomizer.flowersExcluded,
                  )}
                  formState={formState}
                  setFormState={setFormState}
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

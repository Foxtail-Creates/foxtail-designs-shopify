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

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const response = await admin.graphql(
    ` #graphql
      query shopInfo {
        shop {
          metafield (namespace:"foxtail", key:"storeOptions1") {
            id,
            value
          }
          id
        }
      }`,
  );
  const {
    data: { shop },
  } = await response.json();
  var storeOptions: StoreOptions;

  // create new metafield for the store
  if (shop.metafield == null || shop.metafield?.value == null) {
    storeOptions = await createStoreOptions();

    // add new metafield instance,  sample id: "gid://shopify/Shop/63547637914"
    const metadataResponse = await admin.graphql(
      ` #graphql
        mutation setNewMetafield($shopId:ID!, $storeOptions:String!) { 
          metafieldsSet( metafields:[{ownerId:$shopId,
            namespace:"foxtail", key:"storeOptions1", type: "json", value:$storeOptions}]) {
            userErrors {
              message
            }
          }
      }`,
      {
        variables: {
          shopId: shop.id,
          storeOptions: JSON.stringify(storeOptions),
        },
      },
    );
    // todo: error checking for response
  } else {
    storeOptions = JSON.parse(shop.metafield.value);
  }

  return json({
    destination: "product",
    title: "",
    productName: "",
    sizeOptions: ["Small", "Medium", "Large", "Extra-Large"],
    palettesAvailable: storeOptions.palettesAvailable,
    palettesExcluded: storeOptions.palettesExcluded,
    flowersAvailable: storeOptions.flowersAvailable,
    flowersExcluded: storeOptions.flowersExcluded,
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
  const [cleanFormState, setCleanFormState] = useState(byobCustomizerForm);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

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
      sizeOptions: formState.sizeOptions,
      paletteColorOptions: formState.paletteColorOptions,
      focalFlowerOptions: formState.focalFlowerOptions,
    };

    setCleanFormState({ ...formState });
    console.log("Saving form state: ", formState);
    // submit(data, { method: "post" });
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
                {/* TODO: https://linear.app/foxtail-creates/issue/FOX-32/shopify-app-frontend-integrate-with-backend-apis */}
                <SizeSection
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                {/* TODO: https://linear.app/foxtail-creates/issue/FOX-32/shopify-app-frontend-integrate-with-backend-apis */}
                <PaletteSection
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <FocalFlowersSection
                  allFocalFlowerOptions={byobCustomizer.flowersAvailable
                    .concat(byobCustomizer.flowersExcluded)
                    .sort((a, b) => a.flowerName.localeCompare(b.flowerName))}
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
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSaveAndNavigate,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

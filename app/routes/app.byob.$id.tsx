import { useState } from "react";
import {json, redirect } from "@remix-run/node";
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
import { ByobCustomizer } from "~/types";

import db from "../db.server";
import { createStoreOptions, type StoreOptions } from "~/models/StoreSetting.server";
import { Flower } from "@prisma/client";

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
      }`
  );
  const { data: { shop } } = await response.json();
  var storeOptions: StoreOptions;

  // create new metafield for the store
  // if (shop.metafield == null || shop.metafield?.value == null) {
    storeOptions = await createStoreOptions();
    // TODO: new metafield definition for validation

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
          "shopId": shop.id,
          "storeOptions": JSON.stringify(storeOptions)
        }
      }
    );

    // todo: error checking for response

    
  // } else {
  //   storeOptions = JSON.parse(shop.metafield.value);
  // }
  return json({
    destination: "product",
    title: "",
    productName: "",
    sizeOptions: [],
    paletteColorOptions: storeOptions.palettesAvailable,
    focalFlowerOptions: storeOptions.flowersAvailable,
  });
}

export async function action({ request, params }) {
  // const { session } = await authenticate.admin(request);
  // const { shop } = session;

  // /** @type {any} */
  // const data = {
  //   ...Object.fromEntries(await request.formData()),
  //   shop,
  // };

  // if (errors) {
  //   return json({ errors }, { status: 422 });
  // }
}

export default function ByobCustomizationForm() {

  const errors = useActionData()?.errors || {};

  const byobCustomizer: ByobCustomizer = useLoaderData();
  const [formState, setFormState] = useState(byobCustomizer);
  const [cleanFormState, setCleanFormState] = useState(byobCustomizer);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const allFocalFlowerOptions = ["Daffodil", "Iris", "Rose", "Sunflower", "Violet"];

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  function handleSave() {
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
      <ui-title-bar title={byobCustomizer.productName !== "" ? "Edit" : "Create"}>
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
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <PaletteSection
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <FocalFlowersSection
                  allFocalFlowerOptions={allFocalFlowerOptions}
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
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

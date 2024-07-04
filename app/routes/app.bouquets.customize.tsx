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
  BlockStack,
  PageActions,
} from "@shopify/polaris";

import {
  FLOWER_OPTION_NAME,
  FOXTAIL_NAMESPACE,
  STORE_METADATA_CUSTOM_PRODUCT_KEY,
} from "./constants";
import {
  GET_SHOP_METAFIELD_QUERY,
} from "./graphql/shopQueries";
import {
  GET_CUSTOM_PRODUCT_QUERY,
} from "./graphql/productQueries";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS } from "./graphql/productOptionQueries";

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

  if (shop.metafield == null || shop.metafield.value == null) {
    // if custom product does not exist, redirect to create new custom product
    redirect(`/app`);
  }

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
  flowersSelected = flowerOption
    ? flowerOption.optionValues.map((optionValue) => optionValue.name)
    : [];

  return json({
    destination: "product",
    productName: "",
    customProduct: product,
    sizeOptions: ["Small", "Medium", "Large", "Extra-Large"],
    palettesSelected: palettesSelected,
    flowersSelected: flowersSelected,
  });
}

export async function action({ request, params }) {
  // todo
  return redirect(`/app`);
}

export default function ByobCustomizationForm() {
  const errors = useActionData()?.errors || {};

  const byobCustomizer = useLoaderData();
  const byobCustomizerForm = {}

  const [formState, setFormState] = useState(byobCustomizerForm);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  // TODO: https://linear.app/foxtail-creates/issue/FOX-35/shopify-app-frontend-edit-preset-names-and-descriptions
  // TODO: https://linear.app/foxtail-creates/issue/FOX-30/shopify-app-frontend-pricing

  function submitFormData() {
    // todo
    submit({}, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={"Customize product variations"}>
        <button
          variant="breadcrumb"
          onClick={() => navigate("/app/bouquets/settings")}
        >
          Go back to settings
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Edit Customization Names and Prices
                </Text>
                <Text as={"h3"} variant="bodyMd">
                  Helper text ....
                </Text>
                <Divider />
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

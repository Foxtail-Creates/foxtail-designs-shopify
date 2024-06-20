import { useState } from "react";
import { json } from "@remix-run/node";
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

export async function loader({ request, params }) {
  // const { admin } = await authenticate.admin(request);

  // if (params.id === "new") {
    return json({
      destination: "product",
      productName: "",
      sizeOptions: [],
      paletteColorOptions: [],
      focalFlowerOptions: [],
    });
  // }
  // return json({
  //   destination: "product",
  //   productName: "Saved Product",
  //   sizeOptions: ["Small", "Medium", "Large"],
  //   paletteColorOptions: [],
  //   focalFlowerOptions: ["Daffodil"],
  // });
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

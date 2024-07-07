
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import {
  Card,
  Divider,
  Layout,
  Page,
  Text,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import type {
  BouquetCustomizationForm,
  BouquetCustomizationOptions,
  ByobCustomizerOptions,
  OptionValueCustomizations,
} from "~/types";
import { authenticate } from "../shopify.server";

import { getBYOBOptions } from "~/server/getBYOBOptions";
import { CustomizationSection } from "~/components/customizations/CustomizationSection";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const byobOptions: ByobCustomizerOptions = await getBYOBOptions(admin);

  return json(byobOptions);
}


export async function action({ request, params }) {
  // todo
  return redirect(`/app`);
}

const createValueCustomizationsObject = (optionValues: string[]) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    acc[value] = {
      name: value,
      price: 0, // TODO: get price from product variant
    };
    return acc;
  }, {});
};

export default function ByobCustomizationForm() {
  // const errors = useActionData()?.errors || {};

  const formOptions: BouquetCustomizationOptions = useLoaderData();
  const form: BouquetCustomizationForm = {
    sizes: {
      optionName: "Size",
      optionValueCustomizations: createValueCustomizationsObject(formOptions.sizeOptions),
    },
    palettes: {
      optionName: "Palette",
      optionValueCustomizations: createValueCustomizationsObject(formOptions.palettesSelected),
    },
    flowers: {
      optionName: "Focal Flower",
      optionValueCustomizations: createValueCustomizationsObject(formOptions.flowersSelected),
    }
  }

  const [formState, setFormState] = useState(form);

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
                  Edit Names and Prices
                </Text>
                <Text as={"h3"} variant="bodyMd">
                  Helper text ....
                </Text>
                <Divider />
                <CustomizationSection
                  optionKey="sizes"
                  setPrice={true}
                  optionCustomizations={form.sizes}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <CustomizationSection
                  optionKey="palettes"
                  setPrice={false}
                  optionCustomizations={form.palettes}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <CustomizationSection
                  optionKey="flowers"
                  setPrice={true}
                  optionCustomizations={form.flowers}
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

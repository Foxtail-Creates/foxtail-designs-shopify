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
  List,
  Page,
  Text,
  BlockStack,
  PageActions,
  Thumbnail,
} from "@shopify/polaris";
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import type {
  BouquetCustomizationForm,
  ByobCustomizerOptions,
  OptionValueCustomizations,
} from "~/types";
import { authenticate } from "../shopify.server";

import { getBYOBOptions } from "~/server/getBYOBOptions";
import { CustomizationSection } from "~/components/customizations/CustomizationSection";
import { Flower, Palette } from "@prisma/client";
import { Palette as PaletteComponent } from "~/components/palettes/Palette";

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
      connectedLeft: null
    };
    return acc;
  }, {});
};

const createPaletteValueCustomizationsObject = (availablePalettes: Palette[], optionValues: string[]) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    const palette = availablePalettes.find(palette => palette.name === value)

    acc[value] = {
      name: value,
      price: 0,
      connectedLeft: (palette && <PaletteComponent color1={palette.color1} color2={palette?.color2} color3={palette?.color3} />),
    };
    return acc;
  }, {});
};

const createFlowerValueCustomizationsObject = (availableFocalFlowers: Flower[], optionValues: string[]) => {
  if (!optionValues) {
    return {};
  }
  return optionValues.reduce((acc: OptionValueCustomizations, value) => {
    const flowerImageLink = availableFocalFlowers.find(palette => palette.name === value)?.imageLink

    acc[value] = {
      name: value,
      price: 0,
      connectedLeft: <Thumbnail
        size="large"
        alt={"Photo of " + value}
        source={flowerImageLink ?? ""}
      />
    };
    return acc;
  }, {});
};

export default function ByobCustomizationForm() {
  // const errors = useActionData()?.errors || {};

  const formOptions: ByobCustomizerOptions = useLoaderData();

  const form: BouquetCustomizationForm = {
    sizes: {
      optionName: "Size",
      optionValueCustomizations: createValueCustomizationsObject(formOptions.sizeOptions),
    },
    palettes: {
      optionName: "Palette",
      optionValueCustomizations: createPaletteValueCustomizationsObject(
        formOptions.palettesAvailable,
        formOptions.palettesSelected
      ),
    },
    flowers: {
      optionName: "Focal Flower",
      optionValueCustomizations: createFlowerValueCustomizationsObject(formOptions.flowersAvailable, formOptions.flowersSelected),
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
                  Edit Bouquet Option Names and Prices
                </Text>
                <CustomizationSection
                  optionKey="sizes"
                  shouldSetPrice={true}
                  shouldSetName={true}
                  shouldSortOptions={false}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Sizes
                      </Text>
                      <List type="number">
                        <List.Item>
                          Customize the naming for your size options -- for example, rename 'Size' to 'Bouquet Size' and 'Small' to 'Petite'.
                        </List.Item>
                        <List.Item>
                          Edit the prices for each bouquet size. This will be the base price for the product.
                        </List.Item>
                      </List>
                    </>
                  }
                  optionCustomizations={form.sizes}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <CustomizationSection
                  optionKey="palettes"
                  shouldSetPrice={false}
                  shouldSetName={true}
                  shouldSortOptions={true}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Palettes
                      </Text>
                      <List type="number">
                        <List.Item>
                          Customize the naming for your palette options - for example, rename 'Palette' to 'Color Scheme' and 'Pastel' to 'Soft'.
                        </List.Item>
                      </List>
                    </>
                  }
                  optionCustomizations={form.palettes}
                  formState={formState}
                  setFormState={setFormState}
                />
                <Divider />
                <CustomizationSection
                  optionKey="flowers"
                  shouldSetPrice={true}
                  shouldSetName={false}
                  shouldSortOptions={true}
                  instructions={
                    <>
                      <Text as="h2" variant="headingMd">
                        Focal Flowers
                      </Text>
                      <List type="number">
                        <List.Item>
                          Customize the naming for your focal flower options - for example, rename 'Focal Flower' to 'Main Flower'.
                        </List.Item>
                        <List.Item>
                          Edit the add-on price for each focal flower. If the customer chooses a focal flower with an add-on price, this will be in addition to the base price for the product.
                        </List.Item>
                      </List>
                    </>
                  }
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

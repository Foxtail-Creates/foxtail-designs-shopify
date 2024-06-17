import { useCallback, useState, useMemo } from "react";
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
  ChoiceList,
  Divider,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
  BlockStack,
  PageActions,
  Tag,
  Listbox,
  EmptySearchResult,
  Combobox,
  AutoSelection,
  ColorPicker,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  return json({
    destination: "product",
    title: "",
  });
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (errors) {
    return json({ errors }, { status: 422 });
  }
}

export default function ByobCustomizationForm() {
  const errors = useActionData()?.errors || {};

  const byobCustomizer = useLoaderData();
  const [formState, setFormState] = useState(byobCustomizer);
  const [cleanFormState, setCleanFormState] = useState(byobCustomizer);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  // sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["size"]);
  const handleSizesChange = useCallback(
    (value: string[]) => setSelectedSizes(value),
    [],
  );
  // palettes
  const [color1, setColor1] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });
  const [color2, setColor2] = useState({
    hue: 180,
    brightness: 1,
    saturation: 1,
  });
  const [color3, setColor3] = useState({
    hue: 100,
    brightness: 1,
    saturation: 1,
  });

  // focal flowers
  const [selectedFocalFlowers, setSelectedFocalFlowers] = useState<string[]>(
    [],
  );
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      productHandle: formState.productHandle || "",
      destination: formState.destination,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const handleActiveOptionChange = useCallback(
    (activeOption: string) => {
      const activeOptionIsAction = activeOption === value;

      if (
        !activeOptionIsAction &&
        !selectedFocalFlowers.includes(activeOption)
      ) {
        setSuggestion(activeOption);
      } else {
        setSuggestion("");
      }
    },
    [value, selectedFocalFlowers],
  );
  const updateSelection = useCallback(
    (selected: string) => {
      const nextSelectedFocalFlowers = new Set([...selectedFocalFlowers]);

      if (nextSelectedFocalFlowers.has(selected)) {
        nextSelectedFocalFlowers.delete(selected);
      } else {
        nextSelectedFocalFlowers.add(selected);
      }
      setSelectedFocalFlowers([...nextSelectedFocalFlowers]);
      setValue("");
      setSuggestion("");
    },
    [selectedFocalFlowers],
  );

  const removeFocalFlower = useCallback(
    (flower: string) => () => {
      updateSelection(flower);
    },
    [updateSelection],
  );

  const getAllFocalFlowers = useCallback(() => {
    const savedFocalFlowers = [
      "Daffodil",
      "Iris",
      "Rose",
      "Sunflower",
      "Violet",
    ];
    return [...new Set([...savedFocalFlowers, ...selectedFocalFlowers].sort())];
  }, [selectedFocalFlowers]);

  const formatOptionText = useCallback(
    (option: string) => {
      const trimValue = value.trim().toLocaleLowerCase();
      const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

      if (!value || matchIndex === -1) return option;

      const start = option.slice(0, matchIndex);
      const highlight = option.slice(matchIndex, matchIndex + trimValue.length);
      const end = option.slice(matchIndex + trimValue.length, option.length);

      return (
        <p>
          {start}
          <Text fontWeight="bold" as="span">
            {highlight}
          </Text>
          {end}
        </p>
      );
    },
    [value],
  );

  const escapeSpecialRegExCharacters = useCallback(
    (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    [],
  );

  const options = useMemo(() => {
    let list;
    const allFocalFlowers = getAllFocalFlowers();
    const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), "i");

    if (value) {
      list = allFocalFlowers.filter((flower) => flower.match(filterRegex));
    } else {
      list = allFocalFlowers;
    }

    return [...list];
  }, [value, getAllFocalFlowers, escapeSpecialRegExCharacters]);

  const verticalContentMarkup =
    selectedFocalFlowers.length > 0 ? (
      <InlineStack gap="100">
        {/* <LegacyStack spacing="extraTight" alignment="center"> */}
        {selectedFocalFlowers.map((tag) => (
          <Tag key={`option-${tag}`} onRemove={removeFocalFlower(tag)}>
            {tag}
          </Tag>
        ))}
      </InlineStack>
    ) : null;

  const optionMarkup =
    options.length > 0
      ? options.map((option) => {
          return (
            <Listbox.Option
              key={option}
              value={option}
              selected={selectedFocalFlowers.includes(option)}
              accessibilityLabel={option}
            >
              <Listbox.TextOption
                selected={selectedFocalFlowers.includes(option)}
              >
                {formatOptionText(option)}
              </Listbox.TextOption>
            </Listbox.Option>
          );
        })
      : null;

  const noResults = value && !getAllFocalFlowers().includes(value);

  const actionMarkup = noResults ? (
    <Listbox.Action value={value}>{`Add "${value}"`}</Listbox.Action>
  ) : null;

  const emptyStateMarkup = optionMarkup ? null : (
    <EmptySearchResult
      title=""
      description={`No flowers found matching "${value}"`}
    />
  );

  const listboxMarkup =
    optionMarkup || actionMarkup || emptyStateMarkup ? (
      <Listbox
        autoSelection={AutoSelection.None}
        onSelect={updateSelection}
        onActiveOptionChange={handleActiveOptionChange}
      >
        {actionMarkup}
        {optionMarkup}
      </Listbox>
    ) : null;

  return (
    <Page>
      <ui-title-bar title={byobCustomizer.id ? "Edit" : "Create"}>
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
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                  error={errors.title}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Customizations
                  </Text>
                </InlineStack>
                <Divider />
                {/* <Bleed marginInlineStart="200" marginInlineEnd="200"></Bleed> */}
                <InlineStack gap="500" align="space-between" blockAlign="start">
                  <ChoiceList
                    title="Size Options"
                    allowMultiple
                    choices={[
                      { label: "Small", value: "small" },
                      {
                        label: "Medium",
                        value: "medium",
                      },
                      {
                        label: "Large",
                        value: "large",
                      },
                      {
                        label: "Extra-Large",
                        value: "extra-large",
                      },
                    ]}
                    selected={selectedSizes}
                    onChange={handleSizesChange}
                    error={errors.destination}
                  />
                </InlineStack>
                <Divider />
                <Text as="h6" variant="headingLg">
                  {" "}
                  Palette Color Options
                </Text>
                <InlineStack gap="500" align="start">
                  <ColorPicker onChange={setColor1} color={color1} />
                  <ColorPicker onChange={setColor2} color={color2} />
                  <ColorPicker onChange={setColor3} color={color3} />
                </InlineStack>
                <Divider />
                <Combobox
                  allowMultiple
                  preferredPosition="below"
                  activator={
                    <Combobox.TextField
                      autoComplete="off"
                      label="Focal flowers options"
                      value={value}
                      suggestion={suggestion}
                      placeholder="Add focal flowers"
                      verticalContent={verticalContentMarkup}
                      onChange={setValue}
                    />
                  }
                >
                  {listboxMarkup}
                </Combobox>
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
                  !byobCustomizer.id ||
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

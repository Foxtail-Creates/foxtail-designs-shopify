import {
  InlineError,
  InlineStack,
  Tag,
  Listbox,
  EmptySearchResult,
  AutoSelection,
  Combobox,
  Text,
} from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";
import type { FormErrors } from "~/errors";
import type { FocalFlowersSectionProps } from "~/types";

export const FocalFlowersSection = ({
  allFocalFlowerOptions,
  setFormState,
  formState,
  errors
}: FocalFlowersSectionProps) => {
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const allFocalFlowerNames = allFocalFlowerOptions.map(
    (flower) => flower.name,
  );

  const handleActiveOptionChange = useCallback(
    (activeOption: string) => {
      const activeOptionIsAction = activeOption === value;

      if (
        !activeOptionIsAction &&
        !formState.flowersSelected.includes(activeOption)
      ) {
        setSuggestion(activeOption);
      } else {
        setSuggestion("");
      }
    },
    [value, formState.flowersSelected],
  );
  const updateSelection = useCallback(
    (selected: string) => {
      const nextSelectedFocalFlowers = new Set([
        ...formState.flowersSelected,
      ]);

      const focalFlowersToDelete = new Set([
        ...formState.flowerOptionValuesToRemove
      ]);

      const focalFlowersToAdd = new Set([
        ...formState.flowerOptionValuesToAdd
      ]);

      if (nextSelectedFocalFlowers.has(selected)) {
        nextSelectedFocalFlowers.delete(selected);
        focalFlowersToDelete.add(selected);
        focalFlowersToAdd.delete(selected);
      } else {
        nextSelectedFocalFlowers.add(selected);
        focalFlowersToAdd.add(selected);
        focalFlowersToDelete.delete(selected);
      }
      setFormState({
        ...formState,
        flowersSelected: Array.from(nextSelectedFocalFlowers).sort(),
        flowerOptionValuesToRemove: Array.from(focalFlowersToDelete),
        flowerOptionValuesToAdd: Array.from(focalFlowersToAdd)
      });
      setValue("");
      setSuggestion("");
    },
    [formState, setFormState],
  );

  const removeFocalFlower = useCallback(
    (flower: string) => () => {
      updateSelection(flower);
    },
    [updateSelection],
  );

  const getAllFocalFlowers = useCallback(() => {
    return [...new Set(allFocalFlowerNames.sort())];
  }, [allFocalFlowerNames]);

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
    formState.flowersSelected.length > 0 ? (
      <InlineStack gap="100">
        {/* <LegacyStack spacing="extraTight" alignment="center"> */}
        {formState.flowersSelected.map((tag) => (
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
              selected={formState.flowersSelected.includes(option)}
              accessibilityLabel={option}
            >
              <Listbox.TextOption
                selected={formState.flowersSelected.includes(option)}
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

  function inlineError(errors: FormErrors) {
    return (errors != null && errors.flowers != null)
    ? (<InlineError message={errors.flowers} fieldID="flowerId" />)
    : null;
  }

  return (
    <>
      <Text as={"h3"} variant="headingMd">
        Main flower options
      </Text>
      <Combobox
        allowMultiple
        preferredPosition="below"
        activator={
          <Combobox.TextField
            autoComplete="off"
            label="Choose what main flowers you want to offer. The customer will be allowed to choose one (1) main flower for their bouquet."
            value={value}
            suggestion={suggestion}
            placeholder="Add main flowers"
            verticalContent={verticalContentMarkup}
            onChange={setValue}
          />
        }
      >
        {listboxMarkup}
      </Combobox>
      {inlineError(errors)}
    </>
  );
};

import {
  InlineStack,
  Tag,
  Listbox,
  EmptySearchResult,
  AutoSelection,
  Combobox,
  Text,
} from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";

type FocalFlowersSectionProps = {
    savedFocalFlowers: string[];
}

export const FocalFlowersSection = ({savedFocalFlowers }: FocalFlowersSectionProps) => {
  const [selectedFocalFlowers, setSelectedFocalFlowers] = useState<string[]>(
    [],
  );
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");

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
    return [...new Set([...savedFocalFlowers, ...selectedFocalFlowers].sort())];
  }, [savedFocalFlowers, selectedFocalFlowers]);

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
    <>
    <Text as={"h3"} variant="headingMd">Focal flower options</Text>
      <Combobox
        allowMultiple
        preferredPosition="below"
        activator={
          <Combobox.TextField
            autoComplete="off"
            label="Choose what focal flowers you want to offer."
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
    </>
  );
};

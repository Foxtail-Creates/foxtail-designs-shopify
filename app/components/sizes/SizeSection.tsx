import { BlockStack, ChoiceList, InlineError, Text } from "@shopify/polaris";
import type { SizeSectionProps } from "~/types";
import { useCallback } from "react";
import { FormErrors } from "~/errors";


export const SizeSection = ({
  allSizesAvailable,
  formState,
  setFormState,
  errors
}: SizeSectionProps) => {

  const handleChange = useCallback(
    (selected: string[]) => {
      const newSelectedSizes = selected;
      const sizeOptionValuesToAdd = newSelectedSizes.filter(x => !formState.prevSizesSelected.includes(x));
      const sizeOptionValuesToRemove = formState.prevSizesSelected.filter(x => !newSelectedSizes.includes(x));
      setFormState({
        ...formState,
        sizesSelected: newSelectedSizes,
        sizeOptionValuesToAdd: sizeOptionValuesToAdd,
        sizeOptionValuesToRemove: sizeOptionValuesToRemove
      });
    },
    [formState, setFormState]
  );

  function inlineError(errors: FormErrors) {
    return (errors != null && errors.sizes != null)
      ? (<InlineError message={errors.sizes} fieldID="size" />)
      : null;
  }


  function getDisplayName(sizeEnum: string) {
    return formState.sizeEnumToName.customMap[sizeEnum] != null
      ? formState.sizeEnumToName.customMap[sizeEnum]
      : formState.sizeEnumToName.defaultMap[sizeEnum]
  }
  return (
    <BlockStack gap="300">
      <ChoiceList
        title="Size names and prices can be edited on the next page."
        titleHidden={true}
        allowMultiple
        choices={allSizesAvailable.map((option) => {
          return { label: getDisplayName(option), value: option };
        })}
        selected={formState.sizesSelected}
        onChange={handleChange}
      />
      {inlineError(errors)}
      <Text as={"p"} variant="bodyMd" tone="subdued">
        Size names and prices can be edited on the next page.
      </Text>
    </BlockStack>
  );
};

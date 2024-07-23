import { ChoiceList, InlineError, Text } from "@shopify/polaris";
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

  return (
    <>
      <Text as={"h3"} variant="headingMd">
        Size options
      </Text>
      <ChoiceList
        title="Choose what bouquet sizes you want to offer."
        allowMultiple
        choices={allSizesAvailable.map((option) => {
          return { label: option, value: option };
        })}
        selected={formState.sizesSelected}
        onChange={handleChange}
      />
      {inlineError(errors)}
    </>
  );
};

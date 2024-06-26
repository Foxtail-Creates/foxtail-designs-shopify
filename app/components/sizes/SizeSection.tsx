import { ChoiceList, Text } from "@shopify/polaris";
import type { SizeSectionProps } from "~/types";

export const SizeSection = ({
  allSizeOptions,
  formState,
  setFormState,
}: SizeSectionProps) => {
  return (
    <>
      <Text as={"h3"} variant="headingMd">
        Size options
      </Text>
      <ChoiceList
        title="Choose what bouquet sizes you want to offer."
        allowMultiple
        choices={allSizeOptions.map((option) => {
          return { label: option, value: option.toLowerCase() };
        })}
        selected={formState.sizeOptions}
        onChange={(value) => {
          setFormState((prev) => ({ ...prev, sizeOptions: value }));
        }}
      />
    </>
  );
};

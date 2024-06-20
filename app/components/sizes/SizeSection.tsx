import { ChoiceList, Text } from "@shopify/polaris";
import type { SizeSectionProps } from "~/types";

export const SizeSection = ({ formState, setFormState }: SizeSectionProps) => {
  return (
    <>
      <Text as={"h3"} variant="headingMd">
        Size options
      </Text>
      <ChoiceList
        title="Choose what bouquet sizes you want to offer."
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
        selected={formState.sizeOptions}
        onChange={(value) => {setFormState((prev) => ({...prev, sizeOptions: value}))}}
      />
    </>
  );
};

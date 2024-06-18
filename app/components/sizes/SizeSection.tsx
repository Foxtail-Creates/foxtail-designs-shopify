import { ChoiceList, Text } from "@shopify/polaris";
import { useState, useCallback } from "react";

export const SizeSection = () => {
  // sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["size"]);
  const handleSizesChange = useCallback(
    (value: string[]) => setSelectedSizes(value),
    [],
  );

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
        selected={selectedSizes}
        onChange={handleSizesChange}
      />
    </>
  );
};

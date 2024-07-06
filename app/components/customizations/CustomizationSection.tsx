import { InlineGrid, Text, TextField } from "@shopify/polaris";
import type { CustomizationProps, ValueCustomization } from "~/types";

const CustomizationOptions = ({ setPrice, value }: { setPrice: boolean, value: ValueCustomization }) => {
  return (
    <>
      <InlineGrid columns={['oneHalf', 'oneHalf']} gap="400">
        <TextField
          label={`Edit option name: ${value.name}`}
          value={value.name}
          onChange={() => { }
          }
          autoComplete="on"
          selectTextOnFocus={true}
        />
        {setPrice && (
          <TextField
            label={`Edit option price: $${value.price}`}
            type="number"
            value={value.price.toString()}
            prefix="$"
            onChange={() => { }}
            autoComplete="off"
          />)}
      </InlineGrid>
    </>
  )
}

export const CustomizationSection = ({
  setPrice,
  optionCustomizations,
  formState,
  setFormState,
}: CustomizationProps) => {
  return (
    <>
      <TextField
        label={`Edit options category name: ${optionCustomizations.optionName}`}
        value={optionCustomizations.optionName}
        onChange={() => { }}
        autoComplete="on"
        selectTextOnFocus={true}
      />
      {optionCustomizations.optionValueCustomizations &&
        Object
          .values(optionCustomizations.optionValueCustomizations)
          .map((value) => {
            return <CustomizationOptions setPrice={setPrice} value={value} />
          })
      }
    </>
  );
};

import { ChoiceList, TextField } from "@shopify/polaris";
import type { CustomizationProps, ValueCustomization } from "~/types";

const CustomizationOptions = (setPrice: boolean, value: ValueCustomization) => {
  return (
    <>
      <TextField
        label={`Edit customization option name: ${value.name}`}
        value={value.name}
        onChange={() => { }
        }
        autoComplete="off"
      />
      {setPrice && (
        <TextField
          label={`Edit customization option price: ${value.price}`}
          value={value.price.toString()}
          onChange={() => { }}
          autoComplete="off"
        />)}
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
        label={`Edit customizations name: ${optionCustomizations.optionName}`}
        value={optionCustomizations.optionName}
        onChange={() => { }}
        autoComplete="off"
      />
      {optionCustomizations.optionValueCustomizations &&
        Object
          .values(optionCustomizations.optionValueCustomizations)
          .map((value) => {
            return CustomizationOptions(setPrice, value)
          })
      }
    </>
  );
};

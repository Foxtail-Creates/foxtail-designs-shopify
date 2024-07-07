import { InlineGrid, Text, TextField } from "@shopify/polaris";
import type { BouquetCustomizationForm, CustomizationProps, ValueCustomization } from "~/types";


type CustomizationOptionsProps = {
  optionKey: string;
  optionValueKey: string;
  setPrice: boolean;
  value: ValueCustomization;
  formState: BouquetCustomizationForm,
  setFormState: (formState: BouquetCustomizationForm) => void;
};

const CustomizationOptions = (props: CustomizationOptionsProps) => {
  const { optionKey, optionValueKey, setPrice, value, formState, setFormState } = props;
  console.log(optionKey, optionValueKey)
  return (
    <>
      <InlineGrid columns={['oneHalf', 'oneHalf']} gap="400">
        <TextField
          label={`Edit option name: ${value.name}`}
          value={formState[optionKey].optionValueCustomizations[optionValueKey].name}
          // TODO: Clean this up yikes
          onChange={(value) =>
            setFormState(
              {
                ...formState,
                [optionKey]: {
                  ...formState[optionKey],
                  optionValueCustomizations: {
                    ...formState[optionKey].optionValueCustomizations,
                    [optionValueKey]: {
                      ...formState[optionKey].optionValueCustomizations[optionValueKey],
                      name: value,
                    }
                  }
                }
              })
          }
          selectTextOnFocus={true}
          autoComplete="off"
        />
        {setPrice && (
          <TextField
            label={`Edit option price: $${value.price}`}
            type="number"
            prefix="$"
            value={formState[optionKey].optionValueCustomizations[optionValueKey].price.toString()}
            // TODO: Clean this up yikes
            onChange={(value) =>
              setFormState(
                {
                  ...formState,
                  [optionKey]: {
                    ...formState[optionKey],
                    optionValueCustomizations: {
                      ...formState[optionKey].optionValueCustomizations,
                      [optionValueKey]: {
                        ...formState[optionKey].optionValueCustomizations[optionValueKey],
                        price: parseFloat(value)
                      }
                    }
                  }
                })
            }
            autoComplete="off"
          />)}
      </InlineGrid>
    </>
  )
}

export const CustomizationSection = ({
  optionKey,
  setPrice,
  optionCustomizations,
  formState,
  setFormState,
}: CustomizationProps) => {
  return (
    <>
      <TextField
        label={`Edit options category name: ${optionCustomizations.optionName}`}
        value={formState[optionKey].optionName}
        onChange={(value) =>
          setFormState({ ...formState, [optionKey]: { ...formState[optionKey], optionName: value } })
        }
        autoComplete="off"
        selectTextOnFocus={true}
      />
      {optionCustomizations.optionValueCustomizations &&
        Object
          .entries(optionCustomizations.optionValueCustomizations)
          .map(([key, value]) => (
            <CustomizationOptions
              setPrice={setPrice}
              value={value}
              optionKey={optionKey}
              optionValueKey={key}
              formState={formState}
              setFormState={setFormState}
            />
          ))
      }
    </>
  );
};

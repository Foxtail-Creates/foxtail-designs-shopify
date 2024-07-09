import { InlineGrid, Text, TextField } from "@shopify/polaris";
import type { BouquetCustomizationForm, CustomizationProps, ValueCustomization } from "~/types";


type CustomizationOptionsProps = {
  optionKey: string;
  optionValueKey: string;
  setName: boolean;
  setPrice: boolean;
  value: ValueCustomization;
  formState: BouquetCustomizationForm,
  setFormState: (formState: BouquetCustomizationForm) => void;
};

const CustomizationOptions = (props: CustomizationOptionsProps) => {
  const { optionKey, optionValueKey, setPrice, setName, value, formState, setFormState } = props;
  return (
    <>
      <InlineGrid columns={['oneHalf', 'oneHalf']} gap="400">
        {setName && (<TextField
          label={`Edit option name`}
          placeholder={value.name}
          value={formState[optionKey].optionValueCustomizations[optionValueKey].name}
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
        )}
        {setPrice && (
          <TextField
            label={`Edit option price`}
            type="number"
            prefix="$"
            placeholder={value.price.toString()}
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
          {value.connectedRight}
      </InlineGrid>
    </>
  )
}

export const CustomizationSection = ({
  optionKey,
  setPrice,
  setName,
  instructions,
  optionCustomizations,
  formState,
  setFormState,
}: CustomizationProps) => {
  return (
    <>

      {instructions}
      <TextField
        label={`Edit category name`}
        placeholder={optionCustomizations.optionName}
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
              setName={setName}
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

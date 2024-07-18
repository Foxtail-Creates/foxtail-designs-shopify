import { InlineGrid, InlineStack, TextField } from "@shopify/polaris";
import type { BouquetCustomizationForm, CustomizationProps, ValueCustomization } from "~/types";


type CustomizationOptionsProps = {
  optionKey: string;
  optionValueKey: string;
  shouldSetName: boolean;
  shouldSetPrice: boolean;
  value: ValueCustomization;
  formState: BouquetCustomizationForm,
  setFormState: (formState: BouquetCustomizationForm) => void;
};

const CustomizationOptions = (props: CustomizationOptionsProps) => {
  const { optionKey, optionValueKey, shouldSetPrice, shouldSetName, value, formState, setFormState } = props;
  return (
    <>
      <InlineStack gap="400">
        {value.connectedLeft}
        {shouldSetName && (<TextField
          label={`Option name`}
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
        {shouldSetPrice && (
          <TextField
            label={`Price for ${value.name}`}
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
      </InlineStack>
    </>
  )
}

export const CustomizationSection = ({
  optionKey,
  shouldSetPrice,
  shouldSetName,
  shouldSortOptions,
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
        <InlineGrid columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} gap="400" >
          {Object
            .entries(optionCustomizations.optionValueCustomizations)
            .sort((a, b) => shouldSortOptions ? (a[1].name.localeCompare(b[1].name)) : 0)
            .map(([key, value]) => (
              <CustomizationOptions
                key={value.name}
                shouldSetPrice={shouldSetPrice}
                shouldSetName={shouldSetName}
                value={value}
                optionKey={optionKey}
                optionValueKey={key}
                formState={formState}
                setFormState={setFormState}
              />
            ))
          }
        </InlineGrid>
      }
    </>
  );
};

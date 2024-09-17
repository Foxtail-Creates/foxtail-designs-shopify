import { InlineGrid, InlineStack, TextField } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { FLOWER_CUSTOMIZATION_SECTION_NAME, PALETTE_OPTION_NAME, SIZE_CUSTOMIZATION_SECTION_NAME, SIZE_OPTION_NAME } from "~/constants";
import type { BouquetCustomizationForm, CustomizationProps, ValueCustomization } from "~/types";


type CustomizationOptionsProps = {
  optionKey: string;
  optionValueKey: string;
  shouldSetName: boolean;
  shouldSetPrice: boolean;
  value: ValueCustomization;
  formState: BouquetCustomizationForm,
  setFormState: (formState: BouquetCustomizationForm) => void;
  optionValueToPriceUpdates: { [key:string]: number};
};

const CustomizationOptions = (props: CustomizationOptionsProps) => {
  const { optionKey, optionValueKey, shouldSetPrice, shouldSetName, value, formState, setFormState,
    optionValueToPriceUpdates
   } = props;

  const [validationError, setValidationError] = useState("");

  function clearValidationErrors() {
    setValidationError("");
  }

  const updatePrice = useCallback(
    (value: string) => {
      let parsedPrice: number = parseFloat(value);
      if (isNaN(parsedPrice)) {
        parsedPrice = 0;
      }
      const validPrice = parsedPrice >= 0;
      if (validPrice) {
        clearValidationErrors();
        optionValueToPriceUpdates[optionValueKey] = parsedPrice;
      } else {
        setValidationError("Enter a non-negative number");
      }

      setFormState(
        {
          ...formState,
          optionCustomizations: {
            ...formState.optionCustomizations,
            [optionKey]: {
              ...formState.optionCustomizations[optionKey],
              optionValueCustomizations: {
                ...formState.optionCustomizations[optionKey].optionValueCustomizations,
                [optionValueKey]: {
                  ...formState.optionCustomizations[optionKey].optionValueCustomizations[optionValueKey],
                  price: parsedPrice
                }
              }
            }
          },
          ...(validPrice && optionKey === SIZE_CUSTOMIZATION_SECTION_NAME
            && { sizeToPriceUpdates: optionValueToPriceUpdates }
          ),
          ...(validPrice && optionKey === FLOWER_CUSTOMIZATION_SECTION_NAME
            && { flowerToPriceUpdates: optionValueToPriceUpdates }
          )
        }
      )
    },
    [formState, setFormState, optionValueToPriceUpdates]
  );


  const updateOptionValueName = useCallback(
    (value: string) => {
      let customValueName: string | null = null;
      if ((optionKey) === PALETTE_OPTION_NAME) {
        customValueName = "paletteToNameUpdates";
      } else if ((optionKey) === SIZE_OPTION_NAME) {
        customValueName = "sizeToNameUpdates";
      }
      setFormState({
        ...formState,
        ...(customValueName != null &&
          {
            [customValueName]: {
              ...formState[customValueName],
              [optionValueKey]: value
            }
          }
        ),
        optionCustomizations: {
          ...formState.optionCustomizations,
          [optionKey]: {
            ...formState.optionCustomizations[optionKey],
            optionValueCustomizations: {
              ...formState.optionCustomizations[optionKey].optionValueCustomizations,
              [optionValueKey]: {
                ...formState.optionCustomizations[optionKey].optionValueCustomizations[optionValueKey],
                name: value,
              }
            }
          }
        }
      });
    },
    [formState, setFormState]
  );

  return (
    <>
      <InlineStack gap="400">
        {value.connectedLeft}
        {shouldSetName && (<TextField
          label={`Option name`}
          placeholder={value.name}
          value={formState.optionCustomizations[optionKey].optionValueCustomizations[optionValueKey].name}
          onChange={updateOptionValueName}
          selectTextOnFocus={true}
          autoComplete="off"
        />
        )}
        {shouldSetPrice && (
          <TextField
            label={`Price for ${value.name}`}
            type="currency"
            prefix="$"
            placeholder={value.price.toString()}
            value={formState.optionCustomizations[optionKey].optionValueCustomizations[optionValueKey].price.toString()}
            onChange={updatePrice}
            autoComplete="off"
            error={validationError}
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
  optionCustomizations,
  formState,
  optionValueToPriceUpdates,
  setFormState,
}: CustomizationProps) => {
  return (
    <>
      {optionCustomizations.optionValueCustomizations &&
        <InlineGrid columns="1" gap="400" >
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
                optionValueToPriceUpdates= {optionValueToPriceUpdates}
              />
            ))
          }
        </InlineGrid>
      }
    </>
  );
};

import {
  Text,
  BlockStack,
  Checkbox,
  InlineGrid,
  InlineError,
} from "@shopify/polaris";
import { useCallback } from "react";
import { FormErrors } from "~/errors";
import type {
  PaletteChoiceProps,
  PaletteSectionProps,
} from "~/types";
import { Palette } from "./Palette";

const PaletteChoice = ({
  paletteName,
  isChecked,
  setIsChecked: setCheckedPalette,
  color1,
  color2,
  color3
}: PaletteChoiceProps) => {
  return (
    <>
      <InlineGrid gap="100" columns="5">
        <Checkbox
          id={paletteName}
          label={paletteName}
          checked={isChecked}
          onChange={setCheckedPalette}
        />
        <Palette color1={color1} color2={color2} color3={color3} />
      </InlineGrid>
    </>
  );
};

export const PaletteSection = ({
  allPaletteOptions,
  formState,
  setFormState,
  errors
}: PaletteSectionProps) => {
  const sortedPalettes = allPaletteOptions.sort((a, b) =>
    a.name < b.name ? -1 : 1,
  );

  const updateSelection = useCallback(
    (newChecked: boolean, selected: string) => {
      const nextSelectedPalettes = new Set([...formState.palettesSelected]);
      const paletteOptionValuesToAdd = new Set([...formState.paletteOptionValuesToAdd]);
      const paletteOptionValuesToRemove = new Set([...formState.paletteOptionValuesToRemove]);

      if (newChecked) {
        nextSelectedPalettes.add(selected);
        paletteOptionValuesToAdd.add(selected);
        paletteOptionValuesToRemove.delete(selected);
      } else {
        nextSelectedPalettes.delete(selected);
        paletteOptionValuesToAdd.delete(selected);
        paletteOptionValuesToRemove.add(selected);
      }
      setFormState({
        ...formState,
        palettesSelected: Array.from(nextSelectedPalettes),
        paletteOptionValuesToAdd: Array.from(paletteOptionValuesToAdd),
        paletteOptionValuesToRemove: Array.from(paletteOptionValuesToRemove)
      });
    },
    [formState, setFormState],
  );

  function inlineError(errors: FormErrors) {
    return (errors != null && errors.palettes != null)
    ? (<InlineError message={errors.palettes} fieldID="palettes" />)
    : null;
  }

  return (
    <>
      <Text as="h3" variant="headingMd">
        Palette Color Options
      </Text>
      <Text as={"p"} variant="bodyMd">
        Choose what color palettes you want to offer.
      </Text>
      <BlockStack gap="500" align="start">
        {sortedPalettes.map((palette) => (
          <PaletteChoice
            key={palette.name}
            paletteName={palette.name}
            isChecked={formState.palettesSelected.includes(palette.name)}
            setIsChecked={updateSelection}
            color1={palette.color1}
            color2={palette.color2}
            color3={palette.color3}
          />
        ))}
      </BlockStack>
      {inlineError(errors)}
    </>
  );
};

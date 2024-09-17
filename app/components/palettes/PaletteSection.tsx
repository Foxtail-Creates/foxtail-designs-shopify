import {
  Text,
  BlockStack,
  Checkbox,
  InlineStack
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import type {
  PaletteChoiceProps,
  PaletteSectionProps,
} from "~/types";
import { Palette } from "./Palette";
import { inlineError } from "../errors/Error"
const PaletteChoice = ({
  paletteId,
  paletteName,
  isChecked,
  setIsChecked: setCheckedPalette,
  color1,
  color2,
  color3,
}: PaletteChoiceProps) => {
  return (
    <>
      <InlineStack gap="0" align="space-between">

        <Checkbox
          id={paletteId}
          label={paletteName}
          checked={isChecked}
          onChange={setCheckedPalette}
        />
        <Palette color1={color1} color2={color2} color3={color3} />
      </InlineStack>
    </>
  );
};

export const PaletteSection = ({
  allPaletteOptionsSorted,
  formState,
  setFormState,
  errors
}: PaletteSectionProps) => {
  const [validationError, setValidationError] = useState("");

  function clearValidationErrors() {
    setValidationError("");
  }

  const updateSelection = useCallback(
    (newChecked: boolean, paletteId: string) => {
      const nextSelectedPalettes = new Set([...formState.palettesSelected]);
      const paletteOptionValuesToAdd = new Set([...formState.paletteOptionValuesToAdd]);
      const paletteOptionValuesToRemove = new Set([...formState.paletteOptionValuesToRemove]);
      if (newChecked) {
        nextSelectedPalettes.add(paletteId);
        // palette doesn't need to be added if previously selected
        if (!formState.prevPalettesSelected.includes(paletteId)) {
          paletteOptionValuesToAdd.add(paletteId);
        }
        paletteOptionValuesToRemove.delete(paletteId);
      } else {
        nextSelectedPalettes.delete(paletteId);
        paletteOptionValuesToAdd.delete(paletteId);
        paletteOptionValuesToRemove.add(paletteId);
      }

      if (nextSelectedPalettes.size > 5) {
        setValidationError("More than 5 palette options selected. Please keep selections to 5.");
      } else {
        clearValidationErrors();
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

  function getDisplayName(backendId: string) {
    return formState.paletteBackendIdToName.customMap[backendId] != null
      ? formState.paletteBackendIdToName.customMap[backendId]
      : formState.paletteBackendIdToName.defaultMap[backendId]
  }

  return (
    <>
      {inlineError(errors?.palettes, "palettes")}
      {!errors?.palettes && inlineError(validationError, "palettes")}
      <BlockStack gap="300" align="start" id="palettes">
        {allPaletteOptionsSorted.map((palette) => {
          const paletteId: string = palette.id.toString();
          const paletteName: string = getDisplayName(paletteId);
          return (
            <PaletteChoice
              key={paletteName}
              paletteId={paletteId}
              paletteName={paletteName}
              isChecked={formState.palettesSelected.some(selected => selected === paletteId)}
              setIsChecked={updateSelection}
              color1={palette.color1}
              color2={palette.color2}
              color3={palette.color3}
            />
          );
        }
        )}
        <Text as={"p"} variant="bodyMd" tone="subdued">
          Palette names can be edited on the next page.
        </Text>
      </BlockStack>
    </>
  );
};

import {
  InlineStack,
  Text,
  BlockStack,
  Checkbox,
  InlineGrid,
} from "@shopify/polaris";
import { useCallback } from "react";
import type {
  PaletteChoiceProps,
  PaletteSectionProps,
  PaletteSquareInput,
} from "~/types";
import { Palette } from "./Palette";

const paletteSquareStyle = ({ color }: PaletteSquareInput) => ({
  backgroundColor: color,
  width: 50,
  height: 50,
  borderRadius: 5,
});

const PaletteChoice = ({
  paletteName,
  isChecked,
  setIsChecked: setCheckedPalette,
  color1,
  color2,
  color3,
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
}: PaletteSectionProps) => {
  const sortedPalettes = allPaletteOptions.sort((a, b) =>
    a.name < b.name ? -1 : 1,
  );

  const updateSelection = useCallback(
    (newChecked: boolean, selected: string) => {
      const nextSelectedPalettes = new Set([...formState.allPaletteColorOptions]);

      if (newChecked) {
        nextSelectedPalettes.add(selected);
      } else {
        nextSelectedPalettes.delete(selected);
      }
      setFormState({
        ...formState,
        allPaletteColorOptions: Array.from(nextSelectedPalettes).sort(),
      });
    },
    [formState, setFormState],
  );

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
            isChecked={formState.allPaletteColorOptions.includes(palette.name)}
            setIsChecked={updateSelection}
            color1={palette.color1}
            color2={palette.color2}
            color3={palette.color3}
          />
        ))}
      </BlockStack>
    </>
  );
};

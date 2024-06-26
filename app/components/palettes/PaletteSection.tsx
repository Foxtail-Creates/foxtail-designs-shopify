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

const paletteSquareStyle = ({ color }: PaletteSquareInput) => ({
  backgroundColor: color,
  width: 50,
  height: 50,
  borderRadius: 5,
});

const PaletteChoice = ({
  paletteName,
  isChecked,
  setCheckedPalette,
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
        <InlineStack align="start" blockAlign="center" gap="100">
          <div
            className="square-color1"
            style={paletteSquareStyle({ color: color1 })}
          />
          {color2 && (
            <div
              className="square-color2"
              style={paletteSquareStyle({ color: color2 })}
            />
          )}
          {color3 && (
            <div
              className="square-color3"
              style={paletteSquareStyle({ color: color3 })}
            />
          )}
        </InlineStack>
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
      const nextSelectedPalettes = new Set([...formState.paletteColorOptions]);

      if (newChecked) {
        nextSelectedPalettes.add(selected);
      } else {
        nextSelectedPalettes.delete(selected);
      }
      setFormState({
        ...formState,
        paletteColorOptions: Array.from(nextSelectedPalettes).sort(),
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
            isChecked={formState.paletteColorOptions.includes(palette.name)}
            setCheckedPalette={updateSelection}
            color1={palette.color1}
            color2={palette.color2}
            color3={palette.color3}
          />
        ))}
      </BlockStack>
    </>
  );
};

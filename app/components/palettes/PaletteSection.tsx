import { InlineStack, Text, BlockStack, Checkbox } from "@shopify/polaris";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { PaletteSectionProps } from "~/types";

type PaletteColors = {
  paletteName: string;
  checkedPalette: boolean;
  setCheckedPalette: Dispatch<SetStateAction<boolean>>;
  color1: string;
  color2: string | undefined;
  color3: string | undefined;
};

const Palette = ({
  paletteName,
  checkedPalette,
  setCheckedPalette,
  color1,
  color2,
  color3,
}: PaletteColors) => {
  return (
    <>
      <InlineStack gap="500" align="start" blockAlign="center">
        <Checkbox
          label={paletteName}
          checked={checkedPalette}
          onChange={setCheckedPalette}
        />
        <div style={{ borderWidth: 1, borderColor: "black" }}>
          <InlineStack align="start" blockAlign="center">
            <div
              className="square"
              style={{ backgroundColor: color1, width: 50, height: 50 }}
            />
            {color2 && (
              <div
                className="square"
                style={{ backgroundColor: color2, width: 50, height: 50 }}
              />
            )}
            {color3 && (
              <div
                className="square"
                style={{ backgroundColor: color3, width: 50, height: 50 }}
              />
            )}
          </InlineStack>
        </div>
      </InlineStack>
    </>
  );
};
export const PaletteSection = ({
  formState,
  setFormState,
}: PaletteSectionProps) => {
  const [checkedPalette1, setCheckedPalette1] = useState(false);
  const [checkedPalette2, setCheckedPalette2] = useState(false);
  const [checkedPalette3, setCheckedPalette3] = useState(false);

  return (
    <>
      <Text as="h3" variant="headingMd">
        Palette Color Options
      </Text>
      <BlockStack gap="500" align="start">
        <Palette
          paletteName="Palette1"
          checkedPalette={checkedPalette1}
          setCheckedPalette={setCheckedPalette1}
          color1="black"
          color2="green"
          color3="#04ff89"
        />
        <Palette
          paletteName="Palette2"
          checkedPalette={checkedPalette2}
          setCheckedPalette={setCheckedPalette2}
          color1="#ff9ef1"
          color2="#2f9ef2"
          color3={undefined}
        />
        <Palette
          paletteName="Palette3"
          checkedPalette={checkedPalette3}
          setCheckedPalette={setCheckedPalette3}
          color1="#fa9ff1"
          color2={undefined}
          color3={undefined}
        />
      </BlockStack>
    </>
  );
};

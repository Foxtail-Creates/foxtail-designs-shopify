import { useState } from "react";
import { InlineStack, Text, ColorPicker } from "@shopify/polaris";

export const PaletteSection = () => {
  const [color1, setColor1] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });
  const [color2, setColor2] = useState({
    hue: 180,
    brightness: 1,
    saturation: 1,
  });
  const [color3, setColor3] = useState({
    hue: 100,
    brightness: 1,
    saturation: 1,
  });

  return (
    <>
      <Text as="h3" variant="headingMd">
        Palette Color Options
      </Text>
      <InlineStack gap="500" align="start">
        <ColorPicker onChange={setColor1} color={color1} />
        <ColorPicker onChange={setColor2} color={color2} />
        <ColorPicker onChange={setColor3} color={color3} />
      </InlineStack>
    </>
  );
};

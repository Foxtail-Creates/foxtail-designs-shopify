import { InlineStack } from "@shopify/polaris";

import type {
    PaletteSquareInput,
} from "~/types";

type PaletteProps = {
    color1: string;
    color2: string | null;
    color3: string | null;
};

const paletteSquareStyle = ({ color }: PaletteSquareInput) => ({
    backgroundColor: color,
    width: 50,
    height: 50,
    borderRadius: 5,
});

export const Palette = ({ color1, color2, color3 }: PaletteProps) => (
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
)
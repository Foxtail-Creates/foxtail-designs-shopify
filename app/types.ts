import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Product } from "./types/admin.types";
import { FormErrors } from "./errors";
import { TwoWayFallbackMap } from "./server/TwoWayFallbackMap";

export type ByobCustomizerOptions = {
  destination: string;
  productName: string;
  customProduct: Product;
  sizesAvailable: string[];
  sizesSelected: string[];
  palettesAvailable: Palette[];
  palettesSelected: string[]; // backend ids of palettes, as strings
  paletteBackendIdToName: TwoWayFallbackMap;
  sizeBackendIdToName: TwoWayFallbackMap;
  flowersAvailable: Flower[];
  flowersSelected: string[];
  productMetadata: ProductMetadata;
};

export type BouquetSettingsForm = {
  destination: string;
  productName: string;
  allSizeOptions: string[];
  prevSizesSelected: string[];
  sizesSelected: string[];
  sizeOptionValuesToRemove: string[];
  sizeOptionValuesToAdd: string[];
  allPaletteColorOptions: string[];
  palettesSelected: string[];
  paletteOptionValuesToRemove: string[];
  paletteOptionValuesToAdd: string[];
  paletteBackendIdToName: TwoWayFallbackMap;
  allFocalFlowerOptions: string[];
  flowersSelected: string[]
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
  productMetadata: ProductMetadata;
};

export type SerializedSettingForm = {
  productName: string;
  product: Product;
  sizesSelected: string[];
  sizeOptionValuesToRemove: string[];
  sizeOptionValuesToAdd: string[];
  allPaletteColorOptions: string[];
  palettesSelected: string[];
  paletteOptionValuesToRemove: string[];
  paletteOptionValuesToAdd: string[];
  paletteBackendIdToName: SerializedTwoWayFallbackMap;
  allFocalFlowerOptions: string[];
  flowersSelected: string[];
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
  productMetadata: ProductMetadata;
}

export type SerializedTwoWayFallbackMap = {
  customMap: Record<string, string>;
  defaultMap: Record<string, string>;
  reverseCustomMap: Record<string, string>;
  reverseDefaultMap: Record<string, string>;
}

export type SerializedCustomizeForm = {
  product: Product;
  productMetadata: ProductMetadata;
  sizeToPriceUpdates: { [key: string]: number };
  flowerToPriceUpdates: { [key: string]: number };
  optionToNameUpdates: { [key: string]: string };
  paletteToNameUpdates: { [key: string]: string };
  paletteBackendIdToName: SerializedTwoWayFallbackMap;
}

export type FocalFlowersSectionProps = {
  allFocalFlowerOptions: Flower[];
  formState: BouquetSettingsForm;
  setFormState: Dispatch<SetStateAction<BouquetSettingsForm>>;
};

export type PaletteSectionProps = {
  allPaletteOptions: Palette[];
  formState: BouquetSettingsForm;
  setFormState: Dispatch<SetStateAction<BouquetSettingsForm>>;
  errors: FormErrors;
};

export type PaletteChoiceProps = {
  paletteId: string; // backend palette id as a string
  paletteName: string;
  isChecked: boolean;
  setIsChecked: (newChecked: boolean, paletteId: string) => void;
  color1: string;
  color2: string | null;
  color3: string | null;
};

export type PaletteSquareInput = {
  color: string;
};

export type SizeSectionProps = {
  allSizesAvailable: string[];
  formState: BouquetSettingsForm;
  setFormState: Dispatch<SetStateAction<BouquetSettingsForm>>;
  errors: FormErrors;
};

export type BouquetCustomizationOptions = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  palettesSelected: string[];
  flowersSelected: string[];
};

export type BouquetCustomizationForm = {
  optionCustomizations: { [key: string]: OptionCustomization };
  productMetadata: ProductMetadata;
  sizeToPriceUpdates: { [key: string]: number };
  flowerToPriceUpdates: { [key: string]: number };
  optionToNameUpdates: { [key: string]: string };
  paletteToNameUpdates: { [key: string]: string };
};

export type OptionCustomization = {
  optionName: string,
  optionValueCustomizations: {
    [key: string]: ValueCustomization;
  }
}

export type OptionValueCustomizations = {
  [key: string]: ValueCustomization;
}

export type ValueCustomization = {
  name: string;
  price: number;
  connectedLeft: ReactElement | undefined | null;
}

export type CustomizationProps = {
  optionKey: string;
  shouldSetPrice: boolean;
  shouldSetName: boolean;
  shouldSortOptions: boolean;
  instructions: ReactElement | null;
  optionCustomizations: OptionCustomization;
  formState: BouquetCustomizationForm;
  optionValueToPriceUpdates: { [key: string]: number };
  setFormState: Dispatch<SetStateAction<BouquetCustomizationForm>>;
}

export type ProductMetadata = {
  sizeToPrice: { [key: string]: number };
  flowerToPrice: { [key: string]: number };
  optionToName: { [key: string]: string };
  paletteToName: { [key: string]: string }; // backend palette id (as string) to custom palette name
}
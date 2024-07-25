import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Product } from "./types/admin.types";
import { FormErrors } from "./errors";
import { FallbackMap } from "./server/FallbackMap";

export type ByobCustomizerOptions = {
  destination: string;
  productName: string;
  customProduct: Product;
  sizesAvailable: string[];
  sizesSelected: string[];
  palettesAvailable: Palette[];
  palettesSelected: number[];
  paletteNameToBackendId: FallbackMap<string, number>;
  paletteBackendIdToName: FallbackMap<number, string>;
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
  palettesSelected: number[];
  paletteOptionValuesToRemove: number[];
  paletteOptionValuesToAdd: number[];
  paletteNameToBackendId: FallbackMap<string, number>;
  paletteBackendIdToName: FallbackMap<number, string>;
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
  palettesSelected: number[];
  paletteOptionValuesToRemove: number[];
  paletteOptionValuesToAdd: number[];
  paletteNameToBackendId: FallbackMap<string, number>;
  paletteBackendIdToName: FallbackMap<number, string>;
  allFocalFlowerOptions: string[];
  flowersSelected: string[];
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
  productMetadata: ProductMetadata;
}

export type SerializedCustomizeForm = {
  product: Product;
  productMetadata: ProductMetadata;
  sizeToPriceUpdates: { [key: string]: number };
  flowerToPriceUpdates: { [key: string]: number };
  optionToNameUpdates: { [key: string]: string };
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
  paletteId: number;
  paletteName: string;
  isChecked: boolean;
  setIsChecked: (newChecked: boolean, selected: string) => void;
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
  customSizeNames: { [key: string]: string };
}

export type ProductOptionValue = {
  backendId: number;
  displayName: string;
}
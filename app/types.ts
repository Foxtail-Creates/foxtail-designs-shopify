import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Product } from "./types/admin.types";
import { FormErrors } from "./errors";

export type ByobCustomizerOptions = {
  destination: string;
  productName: string;
  customProduct: Product;
  sizeOptions: string[];
  palettesAvailable: Palette[];
  palettesSelected: string[];
  flowersAvailable: Flower[];
  flowersSelected: string[];
};

export type BouquetSettingsForm = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  allPaletteColorOptions: string[];
  allFocalFlowerOptions: string[];
  flowersSelected: string[]
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
};

export type SerializedForm = {
  productName: string;
  product: Product;
  sizeOptions: string[];
  allPaletteColorOptions: string[];
  allFocalFlowerOptions: string[];
  flowersSelected: string[];
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
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
};

export type PaletteChoiceProps = {
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
  allSizeOptions: string[];
  formState: BouquetSettingsForm;
  setFormState: Dispatch<SetStateAction<BouquetSettingsForm>>;
};

export type BouquetCustomizationOptions = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  palettesSelected: string[];
  flowersSelected: string[];
};

export type BouquetCustomizationForm = {
  [key: string]: OptionCustomization;
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
  connectedRight: ReactElement | null;
}

export type CustomizationProps = {
  optionKey: string;
  shouldSetPrice: boolean;
  shouldSetName: boolean;
  shouldSortOptions: boolean;
  instructions: ReactElement | null;
  optionCustomizations: OptionCustomization
  formState: BouquetCustomizationForm;
  setFormState: Dispatch<SetStateAction<BouquetCustomizationForm>>;
}
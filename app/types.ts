import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { Product } from "./types/admin.types";
import { FormErrors } from "./errors";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";

export type ProductImage = {
  id: string;
  alt: string;
}

export type ByobCustomizerOptions = {
  destination: string;
  productName: string;
  productDescription: string;
  customProduct: Product;
  sizesAvailable: string[];
  sizesSelected: string[]; // enums of sizes selected
  palettesAvailableSorted: Palette[];
  palettesSelected: string[]; // backend ids of palettes, as strings
  paletteBackendIdToName: TwoWayFallbackMap;
  sizeEnumToName: TwoWayFallbackMap;
  flowersAvailableSorted: Flower[];
  flowersSelected: string[];
  productMetadata: ProductMetadata;
  productImages: ProductImage[] | undefined;
  shopId: string;
};

export type BouquetSettingsForm = {
  destination: string;
  prevProductName: string;
  productName: string;
  prevProductDescription: string;
  productDescription: string;
  allSizeOptions: string[];
  prevSizesSelected: string[];
  sizesSelected: string[];
  sizeOptionValuesToRemove: string[];
  sizeOptionValuesToAdd: string[];
  allPaletteOptionsSorted: string[];
  prevPalettesSelected: string[];
  palettesSelected: string[];
  paletteOptionValuesToRemove: string[];
  paletteOptionValuesToAdd: string[];
  paletteBackendIdToName: TwoWayFallbackMap;
  sizeEnumToName: TwoWayFallbackMap;
  allFlowerOptionsSorted: string[];
  prevFlowersSelected: string[]
  flowersSelected: string[]
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
  productMetadata: ProductMetadata;
};

export type SerializedSettingForm = {
  prevProductName: string;
  productName: string;
  prevProductDescription: string;
  productDescription: string;
  product: Product;
  sizesSelected: string[];
  sizeOptionValuesToRemove: string[];
  sizeOptionValuesToAdd: string[];
  allPaletteColorOptions: Palette[];
  palettesSelected: string[];
  paletteOptionValuesToRemove: string[];
  paletteOptionValuesToAdd: string[];
  paletteBackendIdToName: SerializedTwoWayFallbackMap;
  sizeEnumToName: SerializedTwoWayFallbackMap;
  allFocalFlowerOptions: string[];
  flowersSelected: string[];
  flowerOptionValuesToRemove: string[];
  flowerOptionValuesToAdd: string[];
  productMetadata: ProductMetadata;
  productImages: ProductImage[] | undefined;
  shopId: string;
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
  paletteToNameUpdates: { [key: string]: string };
  paletteBackendIdToName: SerializedTwoWayFallbackMap;
  sizeToNameUpdates: { [key: string]: string };
  sizeEnumToName: SerializedTwoWayFallbackMap;
}

export type FocalFlowersSectionProps = {
  allFlowerOptionsSorted: Flower[];
  formState: BouquetSettingsForm;
  setFormState: Dispatch<SetStateAction<BouquetSettingsForm>>;
  errors: FormErrors;
};

export type PaletteSectionProps = {
  allPaletteOptionsSorted: Palette[];
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
  paletteToNameUpdates: { [key: string]: string };
  sizeToNameUpdates: { [key: string]: string };
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
  optionCustomizations: OptionCustomization;
  formState: BouquetCustomizationForm;
  optionValueToPriceUpdates: { [key: string]: number };
  setFormState: Dispatch<SetStateAction<BouquetCustomizationForm>>;
}

export type ProductMetadata = {
  sizeToPrice: { [key: string]: number };
  flowerToPrice: { [key: string]: number };
  paletteToName: { [key: string]: string }; // backend palette id (as string) to custom palette name
  sizeToName: { [key: string]: string }; // size enum to custom name
}

export type OptionValue = {
  optionName: string;
  name: string;
}

export type VariantInput = {
  optionValues: OptionValue [];
  price: string;
  inventoryPolicy: string; // DENY or CONTINUE
};
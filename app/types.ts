import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
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

export type ByobCustomizerForm = {
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
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
  errors: FormErrors;
};

export type PaletteSectionProps = {
  allPaletteOptions: Palette[];
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
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
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

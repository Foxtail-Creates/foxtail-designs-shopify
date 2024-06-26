import type { Flower, Palette } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";

export type ByobCustomizerOptions = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  palettesAvailable: Palette[];
  palettesExcluded: Palette[];
  flowersAvailable: Flower[];
  flowersExcluded: Flower[];
};

export type ByobCustomizerForm = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  paletteColorOptions: string[];
  focalFlowerOptions: string[];
};

export type FocalFlowersSectionProps = {
  allFocalFlowerOptions: Flower[];
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

export type PaletteSectionProps = {
  allPaletteOptions: Palette[];
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

export type PaletteChoiceProps = {
  paletteName: string;
  isChecked: boolean;
  setCheckedPalette: (newChecked: boolean, selected: string) => void;
  color1: string;
  color2: string | undefined;
  color3: string | undefined;
};

export type PaletteSquareInput = {
  color: string;
};

export type SizeSectionProps = {
  allSizeOptions: string[];
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

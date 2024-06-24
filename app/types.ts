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
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

export type SizeSectionProps = {
  formState: ByobCustomizerForm;
  setFormState: Dispatch<SetStateAction<ByobCustomizerForm>>;
};

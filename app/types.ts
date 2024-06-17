import { Flower } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";

export type ByobCustomizer = {
  destination: string;
  productName: string;
  sizeOptions: string[];
  paletteColorOptions: string[];
  focalFlowerOptions: string[];
};

export type FocalFlowersSectionProps = {
  allFocalFlowerOptions: Flower[];
  formState: ByobCustomizer;
  setFormState: Dispatch<SetStateAction<ByobCustomizer>>;
};

export type PaletteSectionProps = {
  formState: ByobCustomizer;
  setFormState: Dispatch<SetStateAction<ByobCustomizer>>;
};

export type SizeSectionProps = {
  formState: ByobCustomizer;
  setFormState: Dispatch<SetStateAction<ByobCustomizer>>;
};

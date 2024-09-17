import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { createProduct } from "../services/createProduct";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { createVariantsFromSelectedValues } from "./createVariantsFromSelectedValues";
import { Palette } from "@prisma/client";
import { updateProductMedia } from "./updateProductMedia";
import { ProductImage } from "~/types";

/**
 * Creates a new product
 */
export async function createProductWithOptionsAndVariants(admin: AdminApiContext, selectedFlowers: string[],
  selectedPalettes: string[], selectedSizes: string[], sizeToPrice: { [key: string]: number }, flowerToPrice: { [key: string]: number },
  paletteBackendIdToName: TwoWayFallbackMap, sizeEnumToName: TwoWayFallbackMap, palettesAvailable: Palette[]) {

  const flowerValues = selectedFlowers.map((value: string) => ({ "name": value }));
  const sizeValues = selectedSizes.map((sizeEnum: string) => ({ "name": sizeEnumToName.getValue(sizeEnum) }));
  const paletteValues = selectedPalettes.map((id: string) => ({ "name": paletteBackendIdToName.getValue(id) }));

  const product = await createProduct(admin, flowerValues, sizeValues, paletteValues);

  const media = await updateProductMedia(admin, [], selectedPalettes, [], product.id, palettesAvailable, selectedPalettes);
  const productImages = media
    ?.map((media) => {
      return { id: media.id, alt: media.alt } as ProductImage;
    });

  const customProductWithVariants = await createVariantsFromSelectedValues(
    admin,
    product.id,
    selectedFlowers,
    selectedSizes,
    selectedPalettes,
    sizeToPrice,
    flowerToPrice,
    paletteBackendIdToName,
    sizeEnumToName,
    productImages
  );

  return customProductWithVariants;
}
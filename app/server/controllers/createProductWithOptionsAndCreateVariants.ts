import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { createProduct } from "../services/createProduct";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { createVariantsFromSelectedValues } from "./createVariantsFromSelectedValues";

/**
 * Creates a new product
 */
export async function createProductWithOptionsAndVariants(admin: AdminApiContext, selectedFlowers: string[], optionToName: { [key: string]: string },
  selectedPalettes: string[], selectedSizes: string[], sizeToPrice: { [key: string]: number }, flowerToPrice: { [key: string]: number },
  paletteBackendIdToName: TwoWayFallbackMap, sizeEnumToName: TwoWayFallbackMap) {

  const flowerValues = selectedFlowers.map((value: string) => ({ "name": value }));
  const sizeValues = selectedSizes.map((sizeEnum: string) => ({ "name": sizeEnumToName.getValue(sizeEnum) }));
  const paletteValues = selectedPalettes.map((id: string) => ({ "name": paletteBackendIdToName.getValue(id) }));

  const product = await createProduct(admin, optionToName, flowerValues, sizeValues, paletteValues);

  const customProductWithVariants = await createVariantsFromSelectedValues(
    admin,
    product.id,
    selectedFlowers,
    selectedSizes,
    selectedPalettes,
    sizeToPrice,
    flowerToPrice,
    optionToName,
    paletteBackendIdToName,
    sizeEnumToName
  );
  return customProductWithVariants;
}
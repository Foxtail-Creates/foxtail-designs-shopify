import type {
  SerializedCustomizeForm
} from "~/types";
import { updateOptionAndValueNames } from "./updateOptionAndValueNames";
import { setProductMetadata } from "../services/setProductMetadata";
import { FLOWER_OPTION_NAME, FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_CUSTOM_OPTIONS, SIZE_OPTION_NAME } from "~/constants";
import { convertJsonToTypescript } from "~/jsonToTypescript";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { updateVariantPrices } from "./updateVariantPrices";

export async function saveCustomizations(admin: AdminApiContext, data: SerializedCustomizeForm) {

  const paletteBackendIdToName: TwoWayFallbackMap = convertJsonToTypescript(data.paletteBackendIdToName, TwoWayFallbackMap);
  const sizeEnumToName: TwoWayFallbackMap = convertJsonToTypescript(data.sizeEnumToName, TwoWayFallbackMap);
  const prevProduct = data.product;
  let updatedProduct;

  // update option and option value names
  updatedProduct = await updateCustomOptionandValueNames(admin, prevProduct, {},
    data.productMetadata.optionToName[FLOWER_OPTION_NAME], data.optionToNameUpdates[FLOWER_OPTION_NAME]);

  updatedProduct = await updateCustomOptionandValueNames(admin, data.product, data.paletteToNameUpdates,
    data.productMetadata.optionToName[PALETTE_OPTION_NAME], data.optionToNameUpdates[PALETTE_OPTION_NAME]);

  updatedProduct = await updateCustomOptionandValueNames(admin, data.product, data.sizeToNameUpdates,
    data.productMetadata.optionToName[SIZE_OPTION_NAME], data.optionToNameUpdates[SIZE_OPTION_NAME]);

  // adjust variants to have the proper prices
  await updateVariantPrices(admin, updatedProduct, updatedProduct.variants.nodes, data.productMetadata,
    data.sizeToPriceUpdates, sizeEnumToName, data.flowerToPriceUpdates, data.optionToNameUpdates);
  
  updateMap(data.productMetadata.sizeToPrice, data.sizeToPriceUpdates);
  updateMap(data.productMetadata.flowerToPrice, data.flowerToPriceUpdates);
  updateMap(data.productMetadata.optionToName, data.optionToNameUpdates);

  updateIdMap(data.productMetadata.paletteToName, data.paletteToNameUpdates, paletteBackendIdToName);
  updateIdMap(data.productMetadata.sizeToName, data.sizeToNameUpdates, sizeEnumToName);

  await setProductMetadata(admin, prevProduct.id,
    FOXTAIL_NAMESPACE, PRODUCT_METADATA_CUSTOM_OPTIONS, JSON.stringify(data.productMetadata));
}

async function updateCustomOptionandValueNames(
  admin,
  product,
  optionValueToNameUpdates: { [key:string]: string },
  currentOptionName: string,
  newOptionName?: string
) {
  const updateOptionName: boolean = newOptionName != null && currentOptionName != newOptionName;
  const updateOptionValueNames: boolean = Object.entries(optionValueToNameUpdates).length != 0;
  if (updateOptionName || updateOptionValueNames) {
    // update option and option value names
    const updatedName: string = updateOptionName ? newOptionName : currentOptionName;
    product = await updateOptionAndValueNames(admin, product, currentOptionName, updatedName, optionValueToNameUpdates);
  }
  return product;
} 

function updateMap<T>(original: { [key: string]: T }, updates: { [key: string]: T }) {
  for (const optionValue in updates) {
    original[optionValue] = updates[optionValue];
  }
}

function updateIdMap(oldBackendIdToCustomName: { [key: string]: string }, nameToNewName: { [key: string]: string },
  backendIdToName: TwoWayFallbackMap) {
  for (const oldName in nameToNewName) {
    const backendId: string = backendIdToName.getReverseValue(oldName);
    oldBackendIdToCustomName[backendId] = nameToNewName[oldName];
  }
}

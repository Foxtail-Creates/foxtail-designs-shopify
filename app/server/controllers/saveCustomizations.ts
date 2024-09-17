import type {
  SerializedCustomizeForm
} from "~/types";
import { updateOptionAndValueNames } from "./updateOptionAndValueNames";
import { setProductMetadata } from "../services/setProductMetadata";
import { FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_CUSTOM_OPTIONS, SIZE_OPTION_NAME } from "~/constants";
import { convertJsonToTypescript } from "~/jsonToTypescript";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { updateVariantPrices } from "./updateVariantPrices";

export async function saveCustomizations(admin: AdminApiContext, data: SerializedCustomizeForm) {

  const paletteBackendIdToName: TwoWayFallbackMap = convertJsonToTypescript(data.paletteBackendIdToName, TwoWayFallbackMap);
  paletteBackendIdToName.updateCustomValues(data.paletteToNameUpdates);
  const sizeEnumToName: TwoWayFallbackMap = convertJsonToTypescript(data.sizeEnumToName, TwoWayFallbackMap);
  sizeEnumToName.updateCustomValues(data.sizeToNameUpdates);
  
  const prevProduct = data.product;
  let updatedProduct;

  // update option value names
  updatedProduct = await updateCustomOptionValueNames(admin, data.product, PALETTE_OPTION_NAME, data.paletteToNameUpdates);
  updatedProduct = await updateCustomOptionValueNames(admin, data.product, SIZE_OPTION_NAME, data.sizeToNameUpdates);

  // adjust variants to have the proper prices
  await updateVariantPrices(admin, updatedProduct, updatedProduct.variants.nodes, data.productMetadata,
    data.sizeToPriceUpdates, sizeEnumToName, data.flowerToPriceUpdates, paletteBackendIdToName);
  
  // update metadata 
  updateIdMap(data.productMetadata.paletteToName, data.paletteToNameUpdates, paletteBackendIdToName);
  updateIdMap(data.productMetadata.sizeToName, data.sizeToNameUpdates, sizeEnumToName);
  updateMap(data.productMetadata.sizeToPrice, data.sizeToPriceUpdates);
  updateMap(data.productMetadata.flowerToPrice, data.flowerToPriceUpdates);

  await setProductMetadata(admin, prevProduct.id,
    FOXTAIL_NAMESPACE, PRODUCT_METADATA_CUSTOM_OPTIONS, JSON.stringify(data.productMetadata));
}

async function updateCustomOptionValueNames(
  admin,
  product,
  optionName,
  optionValueToNameUpdates: { [key:string]: string }
) {
  const updateOptionValueNames: boolean = Object.entries(optionValueToNameUpdates).length != 0;
  if (updateOptionValueNames) {
    // update option value names
    product = await updateOptionAndValueNames(admin, product, optionName, optionValueToNameUpdates);
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

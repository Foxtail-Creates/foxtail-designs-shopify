import type {
  SerializedCustomizeForm
} from "~/types";
import { updateOptionAndValueNames } from "./updateOptionAndValueNames";
import { updateVariants } from "./updateVariants";
import { setProductMetadata } from "./setProductMetadata";
import { FLOWER_OPTION_NAME, FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_PRICES, SIZE_OPTION_NAME } from "~/constants";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"

export async function saveCustomizations(admin, data: SerializedCustomizeForm) {
  let jsonConvert: JsonConvert = new JsonConvert();
  jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
  jsonConvert.ignorePrimitiveChecks = true;
  jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // allow null

  // Map to the TwoWayFallbackMap class
  let paletteNameToIdMap: TwoWayFallbackMap;
  try {
    paletteNameToIdMap = jsonConvert.deserializeObject(data.paletteBackendIdToName, TwoWayFallbackMap);
  } catch (e) {
    console.log(e);
    throw "Error converting json palette map to object. Contact Support for help.";
  }

  // Note that order of operations matters. For example when updating prices and option names in the same form,
  // we update price variants using the old option names first, and then update the option names to the new values
  await updateVariants(admin, data.product.id, data.product.variants.nodes, data.productMetadata,
    data.sizeToPriceUpdates, data.flowerToPriceUpdates);

  if (data.optionToNameUpdates[FLOWER_OPTION_NAME] != null
    && data.productMetadata.optionToName[FLOWER_OPTION_NAME] != data.optionToNameUpdates[FLOWER_OPTION_NAME]) {
    await updateOptionAndValueNames(admin, data.product, data.productMetadata.optionToName[FLOWER_OPTION_NAME], data.optionToNameUpdates[FLOWER_OPTION_NAME], {});
  }

  const updatePaletteName: boolean = data.optionToNameUpdates[PALETTE_OPTION_NAME] != null && data.productMetadata.optionToName[PALETTE_OPTION_NAME] != data.optionToNameUpdates[PALETTE_OPTION_NAME];
  const updatePaletteValueNames: boolean = Object.entries(data.paletteToNameUpdates).length != 0;
  if (updatePaletteName || updatePaletteValueNames) {
    // update option and option value names
    const updatedName: string = updatePaletteName ? data.optionToNameUpdates[PALETTE_OPTION_NAME] : data.productMetadata.optionToName[PALETTE_OPTION_NAME];
    await updateOptionAndValueNames(admin, data.product, data.productMetadata.optionToName[PALETTE_OPTION_NAME], updatedName, data.paletteToNameUpdates)
  }

  if (data.optionToNameUpdates[SIZE_OPTION_NAME] != null
    && data.productMetadata.optionToName[SIZE_OPTION_NAME] != data.optionToNameUpdates[SIZE_OPTION_NAME]) {
    await updateOptionAndValueNames(admin, data.product, data.productMetadata.optionToName[SIZE_OPTION_NAME], data.optionToNameUpdates[SIZE_OPTION_NAME], {});
  }

  updateMap(data.productMetadata.sizeToPrice, data.sizeToPriceUpdates);
  updateMap(data.productMetadata.flowerToPrice, data.flowerToPriceUpdates);
  updateMap(data.productMetadata.optionToName, data.optionToNameUpdates);

  updateIdMap(data.productMetadata.paletteToName, data.paletteToNameUpdates, paletteNameToIdMap);
  await setProductMetadata(admin, data.product.id,
    FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, JSON.stringify(data.productMetadata));
}

export function updateMap<T>(original: { [key: string]: T }, updates: { [key: string]: T }) {
  for (const optionValue in updates) {
    original[optionValue] = updates[optionValue];
  }
}

export function updateIdMap(oldBackendIdToCustomName: { [key: string]: string }, nameToNewName: { [key: string]: string },
  backendIdToName: TwoWayFallbackMap) {
  for (const oldName in nameToNewName) {
    const backendId: string = backendIdToName.getValue(oldName);
    oldBackendIdToCustomName[backendId] = nameToNewName[oldName];
  }
}

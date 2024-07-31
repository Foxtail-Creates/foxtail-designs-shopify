import type { SerializedCustomizeForm } from "~/types";

export function sanitizeData(data: SerializedCustomizeForm) {
  for (const key in data.paletteToNameUpdates) {
    data.paletteToNameUpdates[key] = data.paletteToNameUpdates[key].trim();
  }
  for (const key in data.sizeToNameUpdates) {
    data.sizeToNameUpdates[key] = data.sizeToNameUpdates[key].trim();
  }
  for (const key in data.optionToNameUpdates) {
    data.optionToNameUpdates[key] = data.optionToNameUpdates[key].trim();
  }
  return data;
}
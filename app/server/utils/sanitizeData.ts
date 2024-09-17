import type { SerializedCustomizeForm } from "~/types";

export function sanitizeData(data: SerializedCustomizeForm) {
  for (const key in data.paletteToNameUpdates) {
    const newName = data.paletteToNameUpdates[key].trim();
    if (newName.length > 0) {
      data.paletteToNameUpdates[key] = newName;
    } else {
      delete data.paletteToNameUpdates[key];
    }
  }
  for (const key in data.sizeToNameUpdates) {
    const newName = data.sizeToNameUpdates[key].trim();
    if (newName.length > 0) {
      data.sizeToNameUpdates[key] = data.sizeToNameUpdates[key].trim();
    } else {
      delete data.sizeToNameUpdates[key];
    }
  }
  for (const key in data.optionToNameUpdates) {
    const newName = data.optionToNameUpdates[key].trim();
    if (newName.length > 0) {
      data.optionToNameUpdates[key] = newName;
    } else {
      delete data.optionToNameUpdates[key];
    }
  }
  return data;
}
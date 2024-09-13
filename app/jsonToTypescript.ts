
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"

export const jsonConvert: JsonConvert = initializeDefaultConverter();

function initializeDefaultConverter() {
  const jsonConvert = new JsonConvert();
  jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
  jsonConvert.ignorePrimitiveChecks = true;
  jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // allow null
  return jsonConvert;
}

export function convertJsonToTypescript<T extends object>(json: any, targetClassIdentifier: { new (): T }): T {
  try {
    return jsonConvert.deserializeObject(json, targetClassIdentifier);
  } catch (e) {
    console.error(e);
    throw "Error converting json palette map to object. Contact Support for help.";
  }
}

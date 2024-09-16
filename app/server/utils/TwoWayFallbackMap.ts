import { JsonObject, JsonProperty } from "json2typescript";

/**
 * Map class for keys mapped to exactly one value, with fallback to a default value.
 * Only strings are supported, to avoid type problems for the reverse maps
 */
@JsonObject("TwoWayFallbackMap")
export class TwoWayFallbackMap {
  @JsonProperty("customMap")
  customMap: Record<string, string>;

  @JsonProperty("defaultMap")
  defaultMap: Record<string, string>;

  @JsonProperty("reverseCustomMap")
  reverseCustomMap: Record<string, string>;

  @JsonProperty("reverseDefaultMap")
  reverseDefaultMap: Record<string, string>;

  constructor(customMap: Record<string, string>, defaultMap: Record<string, string>) {
    this.customMap = customMap;
    this.defaultMap = defaultMap;

    this.reverseCustomMap = {} as Record<string, string>;
    for (const key in customMap) {
      this.reverseCustomMap[customMap[key]] = key;
    }

    this.reverseDefaultMap = {} as Record<string, string>;
    for (const key in defaultMap) {
      this.reverseDefaultMap[defaultMap[key]] = key;
    }

  }

  updateCustomValues(updates: { [key: string]: string }) {
    for (const key in updates) {
      const val = updates[key];
      const oldVal = this.customMap[key];
      this.customMap[key] = val;  // set key to new value
      delete this.reverseCustomMap[oldVal]; // remove old value from reverse map
      this.reverseCustomMap[val] = key; // add new value to reverse map
    }
  }

  getValue(key: string): string {
    return this.customMap[key] != null ? this.customMap[key] : this.defaultMap[key];
  }

  getReverseValue(value: string): string {
    return this.reverseCustomMap[value] != null ? this.reverseCustomMap[value] : this.reverseDefaultMap[value];
  }

  static getValue(key: string, customMap: Record<string, string>, defaultMap: Record<string, string>): string {
    return customMap[key] != null ? customMap[key] : defaultMap[key];
  }

}
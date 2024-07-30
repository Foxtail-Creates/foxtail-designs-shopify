/**
 * Map class for keys mapped to exactly one value, with fallback to a default value.
 * Only strings are supported, to avoid type problems for the reverse maps
 */
export class TwoWayFallbackMap {
    customMap: Record<string, string>;
    defaultMap: Record<string, string>;

    reverseCustomMap: Record<string, string>;
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
export class FallbackMap<K extends string | number, V extends string | number> {
    customMap: Record<K, V>;
    defaultMap: Record<K, V>;

    constructor(customMap: Record<K, V>, defaultMap: Record<K, V>) {
        this.customMap = customMap;
        this.defaultMap = defaultMap;
    }

    getValue(key: K): V {
        return this.customMap[key] != null ? this.customMap[key] : this.defaultMap[key];
    }
    
}
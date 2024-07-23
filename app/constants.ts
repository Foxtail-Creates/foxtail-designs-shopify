import { ProductMetadata } from "./types";

export const FOXTAIL_NAMESPACE = "foxtail";
export const STORE_METADATA_CUSTOM_PRODUCT_KEY = "customProductId";
export const PRODUCT_METADATA_PRICES = "prices";
export const GRAPHQL_API_VERSION = "2024-07";

// positions for Shopify product options
export const FLOWER_POSITION = 1;
export const SIZE_POSITION = 2;
export const PALETTE_POSITION = 3;

// option names for Shopify product
export const FLOWER_OPTION_NAME = "Focal Flower";
export const SIZE_OPTION_NAME = "Size";
export const PALETTE_OPTION_NAME = "Palette";

// names for customization keys
export const FLOWER_CUSTOMIZATION_SECTION_NAME = "flowers";
export const PALETTE_CUSTOMIZATION_SECTION_NAME = "palettes";
export const SIZE_CUSTOMIZATION_SECTION_NAME = "sizes";

// default size values in different forms
export const SIZE_OPTION_VALUES = ["Small", "Medium", "Large", "Extra-Large"];
export const SIZE_TO_PRICE_DEFAULT_VALUES: {[key: string]: number} = {
    "Small": 40,
    "Medium": 50,
    "Large": 60,
    "Extra-Large": 70
};


export const SIZE_TO_PRICE_DEFAULT_VALUES_SERIALIZED = JSON.stringify(SIZE_TO_PRICE_DEFAULT_VALUES);

// default flower price values
export const DEFAULT_FLOWER_PRICE = 0;

export const FLOWER_TO_PRICE_DEFAULT_VALUES: {[key: string]: number} = {};

export const OPTION_TO_NAME_DEFAULT_VALUES: {[key: string]: string} = {
    [FLOWER_OPTION_NAME]: FLOWER_OPTION_NAME,
    [PALETTE_OPTION_NAME]: PALETTE_OPTION_NAME,
    [SIZE_OPTION_NAME]: SIZE_OPTION_NAME
};

// default price metadata values
export const PRODUCT_METADATA_DEFAULT_VALUES: ProductMetadata = {
    "sizeToPrice": SIZE_TO_PRICE_DEFAULT_VALUES,
    "flowerToPrice": FLOWER_TO_PRICE_DEFAULT_VALUES,
    "optionToName": OPTION_TO_NAME_DEFAULT_VALUES
};

export const PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED = JSON.stringify(PRODUCT_METADATA_DEFAULT_VALUES);

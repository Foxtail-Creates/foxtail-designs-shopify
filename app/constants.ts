import { ProductMetadata } from "./types";
import { Size } from "./size";
import { TwoWayFallbackMap } from "./server/utils/TwoWayFallbackMap";

export const HOME_PATH = "/bouquets"
export const SETTINGS_PATH = "/bouquets/settings";
export const CUSTOMIZE_PATH = "/bouquets/customize";

export const FOXTAIL_NAMESPACE = "$app:foxtail";
export const STORE_METADATA_CUSTOM_PRODUCT_KEY = "customProductId";
export const PRODUCT_METADATA_CUSTOM_OPTIONS = "custom";
export const GRAPHQL_API_VERSION = "2024-07";

// positions for Shopify product options
export const SIZE_POSITION = 1;
export const PALETTE_POSITION = 2;
export const FLOWER_POSITION = 3;

// option names for Shopify product
export const FLOWER_OPTION_NAME = "Main Flower";
export const SIZE_OPTION_NAME = "Size";
export const PALETTE_OPTION_NAME = "Palette";

// names for customization keys
export const FLOWER_CUSTOMIZATION_SECTION_NAME = "flowers";
export const PALETTE_CUSTOMIZATION_SECTION_NAME = "palettes";
export const SIZE_CUSTOMIZATION_SECTION_NAME = "sizes";

// settings page section names
export const SETTINGS_PRODUCT_SECTION_NAME = "Product Name And Description";
export const SETTINGS_SIZE_SECTION_NAME = "Size Options";
export const SETTINGS_PALETTE_SECTION_NAME = "Palette Options";
export const SETTINGS_FLOWER_SECTION_NAME = "Main Flower Options";

// default size values in different forms
export const SIZE_OPTION_VALUES = Object.values(Size);

export const SIZE_TO_PRICE_DEFAULT_VALUES: { [key: string]: number } = {
    [Size.SMALL]: 40,
    [Size.MEDIUM]: 50,
    [Size.LARGE]: 60,
    [Size.EXTRA_LARGE]: 70
};

export const SIZE_TO_NAME_DEFAULT_VALUES: { [key: string]: string } = Object.fromEntries(
    SIZE_OPTION_VALUES.map(s => [s, s])
);

export const SIZE_TO_PRICE_DEFAULT_VALUES_SERIALIZED = JSON.stringify(SIZE_TO_PRICE_DEFAULT_VALUES);

// default flower price values
export const DEFAULT_FLOWER_PRICE = 0;

export const FLOWER_TO_PRICE_DEFAULT_VALUES: { [key: string]: number } = {};

export const OPTION_TO_NAME_DEFAULT_VALUES: { [key: string]: string } = {
    [FLOWER_OPTION_NAME]: FLOWER_OPTION_NAME,
    [PALETTE_OPTION_NAME]: PALETTE_OPTION_NAME,
    [SIZE_OPTION_NAME]: SIZE_OPTION_NAME
};

// default price metadata values
export const PRODUCT_METADATA_DEFAULT_VALUES: ProductMetadata = {
    sizeToPrice: SIZE_TO_PRICE_DEFAULT_VALUES,
    flowerToPrice: FLOWER_TO_PRICE_DEFAULT_VALUES,
    optionToName: OPTION_TO_NAME_DEFAULT_VALUES,
    paletteToName: {},
    sizeToName: {}
};

export const EMPTY_TWO_WAY_MAP: TwoWayFallbackMap = new TwoWayFallbackMap({}, {});

export const PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED = JSON.stringify(PRODUCT_METADATA_DEFAULT_VALUES);

export const PRODUCT_MAIN_IMAGE_SOURCE = "https://lh3.googleusercontent.com/pw/AP1GczM3XFw0Hp76BeWNRd_ibc6CsYduHL_uq8t7R-XRyTSlf8_DTbUuhRAEsJNSgSY32vMQsB0OhTqaIzWn-BDdeRM_uEjz6HtBQIFENf-xjuZJpVqHkTBd3qBJE_71mBljqb7bvnGZzIlhF9i3xqg2I-ZlsA=w1024-h1024-s-no-gm"

export const PRODUCT_NAME = "Build Your Own Bouquet";

export const PRODUCT_DESCRIPTION = `Build your own custom bouquet! Choose a size and color palette, and one type of main flower that will be featured in your bouquet.
We will create a beautiful bouquet based on your selections.
<br/>
<br/>
Photos are for color palette reference only. We will choose blooms based on seasonal availability, your desired color palette, your main flower preference.`;

export const SEO_PRODUCT_NAME = "Custom Flower Arrangements | Build Your Own Bouquet";

export const SEO_PRODUCT_DESCRIPTION = `Build your own custom flower bouquet! Choose your color and flower preferences, and we will create a unique flower arrangement just for you.`;

import { FLOWER_OPTION_NAME, FLOWER_POSITION, FLOWER_TO_PRICE_DEFAULT_VALUES, FOXTAIL_NAMESPACE, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED, PALETTE_OPTION_NAME, PALETTE_POSITION, PRODUCT_METADATA_PRICES, SIZE_OPTION_NAME, SIZE_OPTION_VALUES, SIZE_POSITION, SIZE_TO_PRICE_DEFAULT_VALUES, PRODUCT_METADATA_DEFAULT_VALUES, SIZE_TO_NAME_DEFAULT_VALUES } from "~/constants";
import type {
  ByobCustomizerOptions,
  ProductMetadata,
} from "~/types";
import invariant from "tiny-invariant";
import { createProductOptions } from "../services/createProductOptions";
import { createVariants } from "../services/createVariants";
import { setProductMetadata } from "../services/setProductMetadata";
import { createProductWithOptionsAndVariants } from "./createProductWithOptionsAndCreateVariants";
import { setShopMetafield } from "../services/setShopMetafield";
import { TwoWayFallbackMap } from "../utils/TwoWayFallbackMap";
import { Flower, Palette } from "@prisma/client";
import db from "../../db.server";
import { getShopWithMetafield } from "../services/getShopMetafield";
import { getProduct } from "../services/getProduct";

let flowerCache: Flower[]; // flowers from db, sorted alphabetically by name
let paletteCache: Palette[]; // palettes from db, sorted alphabetically by name
let paletteBackendIdToDefaultName: Record<string, string>; // backend palette id to default palette name

export async function getBYOBOptions(admin): Promise<ByobCustomizerOptions> {
  if (!flowerCache) {
    flowerCache = (await db.flower.findMany())
      .filter((flower) => flower.imageLink?.length)
      .sort((a, b) => a.name < b.name ? -1 : 1);
  }
  const flowersAvailable = flowerCache;

  if (!paletteCache) {
    paletteCache = (await db.palette.findMany())
      .sort((a, b) => a.name < b.name ? -1 : 1);
    paletteBackendIdToDefaultName = {};
    paletteCache.forEach((palette) => {
      paletteBackendIdToDefaultName[palette.id] = palette.name;
    });
  }
  const palettesAvailable = paletteCache;

  invariant(flowersAvailable.length > 0, "No main flowers are available. Contact Support for help.");
  invariant(palettesAvailable.length > 0, "No palettes are available. Contact Support for help.");

  const [firstFlower,] = flowersAvailable;
  const [firstPalette,] = palettesAvailable;

  // set default selections
  let flowersSelected = [firstFlower.name];
  let sizesSelected = SIZE_OPTION_VALUES;
  let palettesSelected: string[] = [firstPalette.id.toString()];

  const sizeEnumToDefaultName: Record<string, string> = SIZE_TO_NAME_DEFAULT_VALUES;

  const shopWithMetafield = await getShopWithMetafield(admin);

  let customProduct;

  const productMetadata: ProductMetadata = PRODUCT_METADATA_DEFAULT_VALUES;
  let paletteBackendIdToName: TwoWayFallbackMap = new TwoWayFallbackMap({}, paletteBackendIdToDefaultName);
  let sizeEnumToName: TwoWayFallbackMap = new TwoWayFallbackMap({}, sizeEnumToDefaultName);

  const productId = shopWithMetafield.metafield?.value;
  if (productId) {

    // if shop metadata has custom product id, retrieve it
    customProduct = await getProduct(admin, productId);

    if (customProduct == null) {
      // if custom product is missing, create new custom product and add to store metadata
      customProduct = await createProductWithOptionsAndVariants(admin, flowersSelected, productMetadata.optionToName, palettesSelected, sizesSelected, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES,
        paletteBackendIdToName, sizeEnumToName);
      await setShopMetafield(admin, shopWithMetafield.id, customProduct.id);
    }

    if (customProduct.metafield?.value != null) {
      const savedMetadata = JSON.parse(customProduct.metafield?.value);
      for (const key in savedMetadata) {
        productMetadata[key] = savedMetadata[key];
      }
      paletteBackendIdToName = new TwoWayFallbackMap(productMetadata.paletteToName, paletteBackendIdToDefaultName);
      sizeEnumToName = new TwoWayFallbackMap(productMetadata.sizeToName, sizeEnumToDefaultName);

    } else {
      // if product metafield is missing for pricing, set metafield to default values
      await setProductMetadata(admin, customProduct.id,
        FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED);
    }


    // retrieve selected options
    const flowerDisplayName = productMetadata.optionToName[FLOWER_OPTION_NAME];
    const flowerOption = customProduct.options.find(
      (option) => option.name === flowerDisplayName,
    );

    const sizeDisplayName = productMetadata.optionToName[SIZE_OPTION_NAME];
    const sizeOption = customProduct.options.find(
      (option) => option.name === sizeDisplayName,
    );

    const paletteDisplayName = productMetadata.optionToName[PALETTE_OPTION_NAME];
    const paletteOption = customProduct.options.find(
      (option) => option.name === paletteDisplayName,
    );
    // filtering out undefined values if existing metadata is a bad state
    flowersSelected = (await getSelectedValues(admin, flowerOption, customProduct, FLOWER_POSITION, flowerDisplayName, flowersSelected))
      .filter((flower) => flower != undefined);
    sizesSelected = (await getSelectedCustomValues(admin, sizeOption, customProduct, SIZE_POSITION, sizeDisplayName, SIZE_OPTION_VALUES, sizeEnumToName))
      .filter((size) => size != undefined);
    palettesSelected = (await getSelectedCustomValues(admin, paletteOption, customProduct, PALETTE_POSITION, paletteDisplayName, palettesSelected, paletteBackendIdToName))
      .filter((palette) => palette != undefined);

    if (sizeOption == null || flowerOption == null || paletteOption == null) {
      // if option previously had no selections, create variants using new default selections
      customProduct = await createVariants(admin, customProduct.id, flowersSelected, sizesSelected, palettesSelected, productMetadata.sizeToPrice, productMetadata.flowerToPrice,
        productMetadata.optionToName, paletteBackendIdToName, sizeEnumToName);
    }
  } else {
    // otherwise create new custom product and add to store metadata
    customProduct = await createProductWithOptionsAndVariants(admin, flowersSelected, productMetadata.optionToName, palettesSelected, SIZE_OPTION_VALUES, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES,
      paletteBackendIdToName, sizeEnumToName);
    await setShopMetafield(admin, shopWithMetafield.id, customProduct.id);
  }

  const productImages = customProduct.media?.nodes
    ?.filter((media) => media.mediaContentType === "IMAGE")
    ?.map((media) => {
      return { id: media.id, alt: media.alt }
    });

  const byobOptions: ByobCustomizerOptions = {
    destination: "product",
    productName: "Build Your Own Bouquet",
    customProduct: customProduct,
    sizesSelected: sizesSelected,
    sizesAvailable: SIZE_OPTION_VALUES,
    sizeEnumToName: sizeEnumToName,
    palettesAvailableSorted: palettesAvailable,
    palettesSelected: palettesSelected,
    paletteBackendIdToName: paletteBackendIdToName,
    flowersAvailableSorted: flowersAvailable,
    flowersSelected: flowersSelected,
    productMetadata: productMetadata,
    productImages: productImages,
  };
  return byobOptions;
};


export async function getSelectedCustomValues(admin, option, customProduct, position: number,
  optionName: string, defaultValues: string[], backendIdToName: TwoWayFallbackMap): Promise<string[]> {
  if (option == null) {
    // create new product option and variants
    await createProductOptions(
      admin,
      customProduct.id,
      position,
      optionName,
      defaultValues
    );
    return defaultValues;
  } else {
    return option.optionValues.map(
      (optionValue) => (backendIdToName.getReverseValue(optionValue.name))
    );
  }
};

export async function getSelectedValues(admin, option, customProduct, position: number, optionName: string, defaultValues: string[]): Promise<string[]> {
  if (option == null) {
    // create new product option and variants
    await createProductOptions(
      admin,
      customProduct.id,
      position,
      optionName,
      defaultValues
    );
    return defaultValues;
  } else {
    return option.optionValues.map(
      (optionValue) => optionValue.name
    );
  }
};
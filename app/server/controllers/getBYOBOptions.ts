import { FLOWER_OPTION_NAME, FLOWER_POSITION, FLOWER_TO_PRICE_DEFAULT_VALUES, FOXTAIL_NAMESPACE, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED, PALETTE_OPTION_NAME, PALETTE_POSITION, PRODUCT_METADATA_CUSTOM_OPTIONS, SIZE_OPTION_NAME, SIZE_OPTION_VALUES, SIZE_POSITION, SIZE_TO_PRICE_DEFAULT_VALUES, PRODUCT_METADATA_DEFAULT_VALUES, SIZE_TO_NAME_DEFAULT_VALUES, PRODUCT_DESCRIPTION, PRODUCT_NAME, SEO_PRODUCT_DESCRIPTION, SEO_PRODUCT_NAME } from "~/constants";
import type {
  ByobCustomizerOptions,
  ProductImage,
  ProductMetadata,
} from "~/types";
import invariant from "tiny-invariant";
import { createProductOptions } from "../services/createProductOptions";
import { setProductMetadata } from "../services/setProductMetadata";
import { createProductWithOptionsAndVariants } from "./createProductWithOptionsAndCreateVariants";
import { setShopMetafield } from "../services/setShopMetafield";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { Flower, Palette } from "@prisma/client";
import db from "../../db.server";
import { getShopWithMetafield } from "../services/getShopMetafield";
import { getProduct } from "../services/getProduct";
import { ProductFieldsFragment } from "~/types/admin.generated";
import { createVariantsFromSelectedValues } from "./createVariantsFromSelectedValues";

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

    if (!customProduct) {
      // if custom product is missing, create new custom product and add to store metadata

      customProduct = await createProductWithOptionsAndVariants(admin, flowersSelected, palettesSelected, sizesSelected, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES,
        paletteBackendIdToName, sizeEnumToName, palettesAvailable);
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
        FOXTAIL_NAMESPACE, PRODUCT_METADATA_CUSTOM_OPTIONS, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED);
    }

    // retrieve selected options
    const flowerOption = customProduct.options.find(
      (option) => option.name === FLOWER_OPTION_NAME,
    );

    const sizeOption = customProduct.options.find(
      (option) => option.name === SIZE_OPTION_NAME,
    );

    const paletteOption = customProduct.options.find(
      (option) => option.name === PALETTE_OPTION_NAME,
    );
    // filtering out undefined values if existing metadata is a bad state
    flowersSelected = (await getSelectedValues(admin, flowerOption, customProduct, FLOWER_POSITION, FLOWER_OPTION_NAME, flowersSelected))
      .filter((flower) => flower != undefined);
    sizesSelected = (await getSelectedCustomValues(admin, sizeOption, customProduct, SIZE_POSITION, SIZE_OPTION_NAME, SIZE_OPTION_VALUES, sizeEnumToName))
      .filter((size) => size != undefined);
    palettesSelected = (await getSelectedCustomValues(admin, paletteOption, customProduct, PALETTE_POSITION, PALETTE_OPTION_NAME, palettesSelected, paletteBackendIdToName))
      .filter((palette) => palette != undefined);

    if (sizeOption == null || flowerOption == null || paletteOption == null) {
      // if option previously had no selections, create variants using new default selections
      const productImages = customProduct.media?.nodes
        ?.filter((media) => media.mediaContentType === "IMAGE")
        ?.map((media) => {
          return { id: media.id, alt: media.alt } as ProductImage
        });
      customProduct = await createVariantsFromSelectedValues(admin, customProduct.id, flowersSelected, sizesSelected, palettesSelected, productMetadata.sizeToPrice, productMetadata.flowerToPrice,
        paletteBackendIdToName, sizeEnumToName, productImages);
    }
  } else {
    // otherwise create new custom product and add to store metadata
    customProduct = await createProductWithOptionsAndVariants(admin, flowersSelected, palettesSelected, SIZE_OPTION_VALUES, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES,
      paletteBackendIdToName, sizeEnumToName, palettesAvailable);
    await setShopMetafield(admin, shopWithMetafield.id, customProduct.id);
  }

  const productImages = customProduct.media?.nodes
    ?.filter((media) => media.mediaContentType === "IMAGE")
    ?.map((media) => {
      return { id: media.id, alt: media.alt } as ProductImage
    });

  const byobOptions: ByobCustomizerOptions = {
    destination: "product",
    productName: customProduct?.title ?? PRODUCT_NAME,
    productDescription: customProduct?.descriptionHtml ?? PRODUCT_DESCRIPTION,
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
    shopId: shopWithMetafield.id
  };
  return byobOptions;
};


export async function getSelectedCustomValues(admin, option, customProduct: ProductFieldsFragment, position: number,
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

export async function getSelectedValues(admin, option, customProduct: ProductFieldsFragment, position: number, optionName: string, defaultValues: string[]): Promise<string[]> {
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
import { FLOWER_OPTION_NAME, FLOWER_POSITION, FLOWER_TO_PRICE_DEFAULT_VALUES, FOXTAIL_NAMESPACE, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED, PALETTE_OPTION_NAME, PALETTE_POSITION, PRODUCT_METADATA_PRICES, SIZE_OPTION_NAME, SIZE_OPTION_VALUES, SIZE_POSITION, SIZE_TO_PRICE_DEFAULT_VALUES, STORE_METADATA_CUSTOM_PRODUCT_KEY, PRODUCT_METADATA_DEFAULT_VALUES } from "~/constants";
import type {
  ByobCustomizerOptions,
  ProductMetadata
} from "~/types";
import { GET_PRODUCT_BY_ID_QUERY, GET_SHOP_METAFIELD_BY_KEY_QUERY } from "./graphql";
import type { StoreOptions} from "~/models/StoreSetting.server";
import { createStoreOptions } from "~/models/StoreSetting.server";
import invariant from "tiny-invariant";
import { getSelectedValues as getSelectedValues} from "./createProductOptions";
import { createVariants } from "./createVariants";
import { setProductMetadata } from "./setProductMetadata";
import { createProductWithOptionsAndVariants } from "./createProductWithOptionsAndCreateVariants";
import { setShopMetafield } from "./setShopMetafield";

export async function getBYOBOptions(admin): Promise<ByobCustomizerOptions> {
  let palettesSelected: string[] = [], flowersSelected: string[] = [], sizesSelected: string[] = [];

  // find existing shop metadata if it exists
  const allCustomOptions: StoreOptions = await createStoreOptions();
  invariant(allCustomOptions.flowersAvailable.length > 0, "No focal flowers are available. Contact Support for help.");
  invariant(allCustomOptions.palettesAvailable.length > 0, "No palettes are available. Contact Support for help.");

  const [firstFlower,] = allCustomOptions.flowersAvailable;
  const [firstPalette,] = allCustomOptions.palettesAvailable;
  const defaultFlowerValues = [firstFlower.name];
  const defaultPaletteValues = [firstPalette.name];

  const getShopMetadataResponse = await admin.graphql(
    GET_SHOP_METAFIELD_BY_KEY_QUERY,
    {
      variables: {
        namespace: FOXTAIL_NAMESPACE,
        key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
      },
    },
  );
  const shopMetadataBody = await getShopMetadataResponse.json();
  let customProduct;
  const productMetadata: ProductMetadata = PRODUCT_METADATA_DEFAULT_VALUES;

  const productId = shopMetadataBody.data?.shop.metafield?.value
  if (productId != undefined && productId != null) {
    // if shop metadata has custom product id, retrieve it
    const customProductResponse = await admin.graphql(
      GET_PRODUCT_BY_ID_QUERY,
      {
        variables: {
          id: productId,
          namespace: FOXTAIL_NAMESPACE,
          key: PRODUCT_METADATA_PRICES
        },
      },
    );
    customProduct = (await customProductResponse.json()).data.product;
    
    if (customProduct == null) {
      // if custom product is missing, create new custom product and add to store metadata
      customProduct = await createProductWithOptionsAndVariants(admin, defaultFlowerValues, productMetadata.optionToName, defaultPaletteValues, SIZE_OPTION_VALUES, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES);
      await setShopMetafield(admin, shopMetadataBody.data?.shop.id, customProduct.id);
    }

    if (customProduct.metafield?.value != null) {
      const savedMetadata = JSON.parse(customProduct.metafield?.value);
      for (const key in savedMetadata) {
        productMetadata[key] = savedMetadata[key];
      }
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
    flowersSelected = await getSelectedValues(admin, flowerOption, customProduct, FLOWER_POSITION, flowerDisplayName, defaultFlowerValues);
    sizesSelected = await getSelectedValues(admin, sizeOption, customProduct, SIZE_POSITION, sizeDisplayName, SIZE_OPTION_VALUES);
    palettesSelected = await getSelectedValues(admin, paletteOption, customProduct, PALETTE_POSITION, paletteDisplayName, defaultPaletteValues);

    if (sizeOption == null || flowerOption == null || paletteOption == null) {
      // if option previously had no selections, create variants using new default selections
      customProduct = await createVariants(admin, customProduct.id, flowersSelected, sizesSelected, palettesSelected, productMetadata.sizeToPrice, productMetadata.flowerToPrice, productMetadata.optionToName);
    }
  } else {
    // otherwise create new custom product and add to store metadata
    customProduct = await createProductWithOptionsAndVariants(admin, defaultFlowerValues, productMetadata.optionToName, defaultPaletteValues, SIZE_OPTION_VALUES, SIZE_TO_PRICE_DEFAULT_VALUES, FLOWER_TO_PRICE_DEFAULT_VALUES);
    await setShopMetafield(admin, shopMetadataBody.data?.shop.id, customProduct.id);
  }
  const byobOptions: ByobCustomizerOptions = {
    destination: "product",
    productName: "BYOB",
    customProduct: customProduct,
    sizesSelected: sizesSelected,
    sizesAvailable: SIZE_OPTION_VALUES,
    palettesAvailable: allCustomOptions.palettesAvailable,
    palettesSelected: palettesSelected,
    flowersAvailable: allCustomOptions.flowersAvailable,
    flowersSelected: flowersSelected,
    productMetadata: productMetadata
  };
  return byobOptions;
};
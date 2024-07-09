import { FLOWER_OPTION_NAME, FLOWER_POSITION, FOXTAIL_NAMESPACE, SIZE_OPTION_NAME, SIZE_OPTION_VALUES, SIZE_POSITION, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import type {
  ByobCustomizerOptions
} from "~/types";
import { GET_PRODUCT_BY_ID_QUERY, CREATE_PRODUCT_WITH_OPTIONS_QUERY, GET_SHOP_METAFIELD_BY_KEY_QUERY, SET_SHOP_METAFIELDS_QUERY } from "./graphql";
import type { StoreOptions} from "~/models/StoreSetting.server";
import { createStoreOptions } from "~/models/StoreSetting.server";
import invariant from "tiny-invariant";
import { getSelectedValues as getSelectedValues} from "./createProductOptions";
import { createVariants } from "./createVariants";

export async function getBYOBOptions(admin): Promise<ByobCustomizerOptions> {
  const palettesSelected: string[] = [], flowersSelected: string[] = [], sizesSelected: string[] = [];

  // find existing shop metadata if it exists
  const allCustomOptions: StoreOptions = await createStoreOptions();
  invariant(allCustomOptions.flowersAvailable.length > 0, "No focal flowers in database. Contact Support for help.");
  const [firstFlower,] = allCustomOptions.flowersAvailable;

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
  let customProductBody;

  if (shopMetadataBody.data?.shop.metafield?.value != null) {
    // if custom product already exists, retrieve it
    const customProductResponse = await admin.graphql(
      GET_PRODUCT_BY_ID_QUERY,
      {
        variables: {
          id: shopMetadataBody.data?.shop.metafield?.value
        },
      },
    );
    customProductBody = await customProductResponse.json();
    const flowerValues = [firstFlower.name];
    const flowerOption = customProductBody.data?.product.options.find(
      (option) => option.name === FLOWER_OPTION_NAME,
    );
    const sizeOption = customProductBody.data?.product.options.find(
      (option) => option.name === SIZE_OPTION_NAME,
    );
    flowersSelected = await getSelectedValues(admin, flowerOption, customProductBody, FLOWER_POSITION, FLOWER_OPTION_NAME, flowerValues);
    sizesSelected = await getSelectedValues(admin, sizeOption, customProductBody, SIZE_POSITION, SIZE_OPTION_NAME, SIZE_OPTION_VALUES);
    if (sizeOption == null || flowerOption == null) {
      createVariants(admin, customProductBody.data.product.id, flowersSelected, sizesSelected);
    }
  } else {
    // otherwise create new custom product and add to store metadata
    flowersSelected = firstFlower != null ? [firstFlower.name] : [];
    sizesSelected = SIZE_OPTION_VALUES;
    const customProductResponse = await admin.graphql(
      CREATE_PRODUCT_WITH_OPTIONS_QUERY,
      {
        variables: {
          productName: "Custom Bouquet",
          productType: "Custom Flowers",
          flowerOptionName: FLOWER_OPTION_NAME,
          flowerPosition: FLOWER_POSITION,
          flowerValues: flowersSelected,
          sizeOptionName: SIZE_OPTION_NAME,
          sizePosition: SIZE_POSITION,
          sizeValues: sizesSelected
        },
      },
    );

    customProductBody = await customProductResponse.json();

    await createVariants(admin, customProductBody.data.product.id, flowersSelected, sizesSelected);

    // set shop metafield to point to new custom product id
    const setStoreMetafieldResponse = await admin.graphql(
      SET_SHOP_METAFIELDS_QUERY,
      {
        variables: {
          shopId: shopMetadataBody.data?.shop.id,
          productId: customProductBody.data?.product.id,
          namespace: FOXTAIL_NAMESPACE,
          key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
        },
      },
    );
    const storeMetafieldBody = await setStoreMetafieldResponse.json();
    invariant(storeMetafieldBody.data.metafieldsSet.userErrors.length == 0,
      "Error creating new product options. Contact Support for help."
    );

  }
  const byobOptions: ByobCustomizerOptions = {
    destination: "product",
    productName: "BYOB",
    customProduct: customProductBody.data?.product,
    sizesSelected: sizesSelected,
    sizesAvailable: SIZE_OPTION_VALUES,
    palettesAvailable: allCustomOptions.palettesAvailable,
    palettesSelected: palettesSelected,
    flowersAvailable: allCustomOptions.flowersAvailable,
    flowersSelected: flowersSelected,
  };
  return byobOptions;
};


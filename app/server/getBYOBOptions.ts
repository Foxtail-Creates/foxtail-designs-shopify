import { FLOWER_OPTION_NAME, FLOWER_POSITION, FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import type {
  ByobCustomizerOptions
} from "~/types";
import { GET_PRODUCT_BY_ID_QUERY, CREATE_PRODUCT_WITH_OPTIONS_QUERY, GET_SHOP_METAFIELD_BY_KEY_QUERY, SET_SHOP_METAFIELDS_QUERY } from "./graphql";
import type { StoreOptions} from "~/models/StoreSetting.server";
import { createStoreOptions } from "~/models/StoreSetting.server";
import invariant from "tiny-invariant";
import { createProductOptions } from "./createProductOptions";

export async function getBYOBOptions(admin): Promise<ByobCustomizerOptions> {
  let palettesSelected: string[] = [], flowersSelected: string[] = [];

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
    const flowerOption = customProductBody.data?.product.options.find(
      (option) => option.name === FLOWER_OPTION_NAME,
    );

    if (flowerOption == null) {
      // create new product option and variants
      await createProductOptions(
        admin,
        customProductBody.data?.product.id,
        FLOWER_POSITION,
        FLOWER_OPTION_NAME,
        [firstFlower.name]
      );
      flowersSelected = [firstFlower.name];
    } else {
      flowersSelected = flowerOption.optionValues.map(
        (optionValue) => optionValue.name,
      );
    }
  } else {
    // otherwise create new custom product and add to store metadata
    flowersSelected = firstFlower != null ? [firstFlower.name] : [];
    const customProductResponse = await admin.graphql(
      CREATE_PRODUCT_WITH_OPTIONS_QUERY,
      {
        variables: {
          productName: "Custom Bouquet",
          productType: "Custom Flowers",
          flowerOptionName: FLOWER_OPTION_NAME,
          flowerPosition: FLOWER_POSITION,
          flowerValues: flowersSelected,
        },
      },
    );

    customProductBody = await customProductResponse.json();

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
    sizeOptions: ["Small", "Medium", "Large", "Extra-Large"],
    palettesAvailable: allCustomOptions.palettesAvailable,
    palettesSelected: palettesSelected,
    flowersAvailable: allCustomOptions.flowersAvailable,
    flowersSelected: flowersSelected,
  };
  return byobOptions;
};

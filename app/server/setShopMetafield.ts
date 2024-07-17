import invariant from "tiny-invariant";
import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { SET_SHOP_METAFIELDS_QUERY } from "./graphql";

export async function setShopMetafield(admin, shopId, productId) {
    const setStoreMetafieldResponse = await admin.graphql(
        SET_SHOP_METAFIELDS_QUERY,
        {
          variables: {
            shopId: shopId,
            productId: productId,
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

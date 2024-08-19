import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "../graphql";

export async function getShopWithMetafield(admin) {
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
  return shopMetadataBody.data?.shop;
}

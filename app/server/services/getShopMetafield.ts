import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { Shop } from "~/types/admin.types";

export async function getShopWithMetafield(admin: AdminApiContext): Promise<Shop> {
  const shopMetadataBody = await sendQuery(
    admin,
    GET_SHOP_METAFIELD_BY_KEY_QUERY,
    {
      variables: {
        namespace: FOXTAIL_NAMESPACE,
        key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
      },
    },
  );
  return shopMetadataBody.data?.shop;
}

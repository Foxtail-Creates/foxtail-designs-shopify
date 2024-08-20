import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { SET_SHOP_METAFIELDS_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { SetShopMetafieldsMutation } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function setShopMetafield(
  admin: AdminApiContext,
  shopId: string,
  productId: string
) {
  const storeMetafieldBody: FetchResponseBody<SetShopMetafieldsMutation> = await sendQuery(
    admin,
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

  const hasErrors: boolean = storeMetafieldBody.data?.metafieldsSet?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error setting shop metafield.\n User errors: { "
      + storeMetafieldBody.data?.metafieldsSet?.userErrors
      + "}");
  }
}

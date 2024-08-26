import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { SET_PRODUCT_METAFIELD_QUERY } from "../graphql";
import { sendQuery } from "../graphql/client/sendQuery";

export async function setProductMetadata(
  admin: AdminApiContext,
  productId: string,
  namespace: string,
  key: string,
  value: string
) {
  const setProductMetafieldBody = await sendQuery(
    admin,
    SET_PRODUCT_METAFIELD_QUERY,
    {
      variables: {
        productId: productId,
        namespace: namespace,
        key: key,
        value: value
      },
    },
  );
  const hasErrors: boolean = setProductMetafieldBody.data.metafieldsSet.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error setting product metafield.\n User errors: { "
      + JSON.stringify(setProductMetafieldBody.data.metafieldsSet.userErrors)
      + "}");
  }
};

import { FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES } from "~/constants";
import { GET_PRODUCT_BY_ID_QUERY } from "../graphql";

export async function getProduct(admin, productId) {
  const productResponse = await admin.graphql(
    GET_PRODUCT_BY_ID_QUERY,
    {
      variables: {
        id: productId,
        namespace: FOXTAIL_NAMESPACE,
        key: PRODUCT_METADATA_PRICES
      },
    },
  );
  const productBody = await productResponse.json();
  return productBody.data?.product;
}

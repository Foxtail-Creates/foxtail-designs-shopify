import { FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES } from "~/constants";
import { GET_PRODUCT_BY_ID_QUERY } from "../graphql";
import { GetProductByIdQuery, ProductFieldsFragment } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";

export async function getProduct(admin: AdminApiContext, productId: string): Promise<ProductFieldsFragment | undefined | null> {
  const productBody: FetchResponseBody<GetProductByIdQuery> = await sendQuery(
    admin,
    GET_PRODUCT_BY_ID_QUERY,
    {
      variables: {
        id: productId,
        namespace: FOXTAIL_NAMESPACE,
        key: PRODUCT_METADATA_PRICES
      },
    },
  )
  return productBody.data?.product;
}

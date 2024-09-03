import { FetchResponseBody } from "@shopify/admin-api-client";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { GetProductPreviewByIdQuery } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";
import { GET_PRODUCT_PREVIEW_BY_ID_QUERY } from "../graphql/queries/product/getProductById";

export async function getProductPreview(admin: AdminApiContext, productId: string) {
    const productBody: FetchResponseBody<GetProductPreviewByIdQuery> = await sendQuery(
      admin,
      GET_PRODUCT_PREVIEW_BY_ID_QUERY,
      {
        variables: {
          id: productId
        },
      },
    )
    return productBody.data?.product;
  }
  

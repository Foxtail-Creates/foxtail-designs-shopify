import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { DELETE_PRODUCT_QUERY } from "../graphql";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { DeleteCustomProductMutation } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";

export async function deleteProduct(admin: AdminApiContext, productId: string) {
  const deleteProductBody: FetchResponseBody<DeleteCustomProductMutation> = await sendQuery(
    admin,
    DELETE_PRODUCT_QUERY,
    {
      variables: {
        productId: productId
      },
    },
  );
  const hasErrors: boolean = deleteProductBody.data?.productDelete?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error updating variants.\n User errors: { "
      + JSON.stringify(deleteProductBody.data?.productDelete?.userErrors)
      + " }");
  }
}
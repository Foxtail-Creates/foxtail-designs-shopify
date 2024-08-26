import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { ACTIVATE_PRODUCT_QUERY } from "../graphql";
import { sendQuery } from "../graphql/client/sendQuery";
import { ActivateProductMutation } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function activateProduct(admin: AdminApiContext, productId: string) {
  const activateProductBody: FetchResponseBody<ActivateProductMutation> = await sendQuery(
    admin,
    ACTIVATE_PRODUCT_QUERY,
    {
      variables: {
        id: productId
      },
    },
  );
  const hasErrors: boolean = activateProductBody.data?.productChangeStatus?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error activating product.\n User errors: { "
      + JSON.stringify(activateProductBody.data?.productChangeStatus?.userErrors)
      + " }");
  }
}
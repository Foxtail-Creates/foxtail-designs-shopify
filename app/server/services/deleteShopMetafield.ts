import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { DELETE_STORE_METAFIELD_QUERY } from "../graphql";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { DeleteStoreMetafieldMutation } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";

export async function deleteShopMetafield(admin: AdminApiContext, metafieldId: string) {
  const deleteStoreMetafieldBody: FetchResponseBody<DeleteStoreMetafieldMutation> = await sendQuery(
    admin,
    DELETE_STORE_METAFIELD_QUERY,
    {
      variables: {
        metafieldId: metafieldId
      },
    },
  );
  const hasErrors: boolean = deleteStoreMetafieldBody.data?.metafieldDelete?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error deleting shop metafield.\n User errors: { "
      + deleteStoreMetafieldBody.data?.metafieldDelete?.userErrors
      + "}");
  }
}

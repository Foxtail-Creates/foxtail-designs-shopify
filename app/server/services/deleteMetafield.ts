import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { DELETE_METAFIELD_QUERY } from "../graphql";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { DeleteMetafieldMutation } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";

export async function deleteMetafield(admin: AdminApiContext, metafieldId: string) {
  const deleteMetafieldBody: FetchResponseBody<DeleteMetafieldMutation> = await sendQuery(
    admin,
    DELETE_METAFIELD_QUERY,
    {
      variables: {
        metafieldId: metafieldId
      },
    },
  );
  const hasErrors: boolean = deleteMetafieldBody.data?.metafieldDelete?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error deleting metafield.\n User errors: { "
      + JSON.stringify(deleteMetafieldBody.data?.metafieldDelete?.userErrors)
      + "}");
  }
}

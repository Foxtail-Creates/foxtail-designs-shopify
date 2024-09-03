import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { UNPUBLISH_PRODUCT_QUERY } from "../graphql";
import { sendQuery } from "../graphql/client/sendQuery";
import { UnpublishProductMutation } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function unpublishProduct(
  admin: AdminApiContext,
  id: string,
  publicationId: string
) {
  const unpublishProductResponseBody: FetchResponseBody<UnpublishProductMutation> = await sendQuery(
    admin,
    UNPUBLISH_PRODUCT_QUERY,
    {
      variables: {
        id: id,
        publicationId: publicationId
      },
    },
  );
  const hasErrors: boolean = unpublishProductResponseBody.data?.publishableUnpublish?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error unpublishing product.\n User errors: { "
      + JSON.stringify(unpublishProductResponseBody.data?.publishableUnpublish?.userErrors)
      + "}");
  }
}

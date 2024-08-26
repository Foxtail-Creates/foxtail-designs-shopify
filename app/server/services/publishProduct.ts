import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { PUBLISH_PRODUCT_QUERY } from "../graphql";
import { sendQuery } from "../graphql/client/sendQuery";
import { PublishProductMutation } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function publishProduct(
  admin: AdminApiContext,
  id: string,
  publicationId: string
) {
  const publishProductResponseBody: FetchResponseBody<PublishProductMutation> = await sendQuery(
    admin,
    PUBLISH_PRODUCT_QUERY,
    {
      variables: {
        id: id,
        publicationId: publicationId
      },
    },
  );
  const hasErrors: boolean = publishProductResponseBody.data?.publishablePublish?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error publishing product.\n User errors: { "
      + JSON.stringify(publishProductResponseBody.data?.publishablePublish?.userErrors)
      + "}");
  }
}

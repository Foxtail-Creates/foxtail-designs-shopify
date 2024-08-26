import { DELETE_PRODUCT_MEDIA_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { DeleteProductMediaMutation } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function deleteProductMedia(
  admin: AdminApiContext,
  mediaIds: string[],
  productId: string,
) {
  const deleteProductMediaBody: FetchResponseBody<DeleteProductMediaMutation> = await sendQuery(
    admin,
    DELETE_PRODUCT_MEDIA_QUERY,
    {
      variables: {
        mediaIds: mediaIds,
        productId: productId,
      },
    },
  );
  const hasErrors: boolean = deleteProductMediaBody.data?.productDeleteMedia?.mediaUserErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error deleting product images.\n User errors: { "
      + JSON.stringify(deleteProductMediaBody.data?.productDeleteMedia?.mediaUserErrors)
      + " }");
  }
};

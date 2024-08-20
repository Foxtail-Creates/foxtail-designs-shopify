import invariant from "tiny-invariant";
import { CREATE_PRODUCT_MEDIA_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { sendQuery } from "../graphql/client/sendQuery";
import { CreateProductMediaMutation } from "~/types/admin.generated";

export type CreateMediaInput = {
  alt: string,
  originalSource: string,
  mediaContentType: string,
};

export async function createProductMedia(
  admin: AdminApiContext,
  media: CreateMediaInput[],
  productId: string,
) {
  const createProductMediaBody: FetchResponseBody<CreateProductMediaMutation> = await sendQuery(
    admin,
    CREATE_PRODUCT_MEDIA_QUERY,
    {
      variables: {
        productId: productId,
        media: media,
      },
    },
  );
  const hasErrors: boolean = createProductMediaBody.data?.productCreateMedia?.mediaUserErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error setting product images.\n User errors: { "
      + createProductMediaBody.data?.productCreateMedia?.mediaUserErrors
      + " }");
  }
};

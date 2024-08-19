import invariant from "tiny-invariant";
import { CREATE_PRODUCT_MEDIA_QUERY } from "../graphql";

export type CreateMediaInput = {
  alt: string,
  originalSource: string,
  mediaContentType: string,
};

export async function createProductMedia(
  admin,
  media: CreateMediaInput[],
  productId: string,
) {
  const createProductMediaResponse = await admin.graphql(
    CREATE_PRODUCT_MEDIA_QUERY,
    {
      variables: {
        productId: productId,
        media: media,
      },
    },
  );
  const createProductMediaBody = await createProductMediaResponse.json();
  invariant(createProductMediaBody.data.productCreateMedia.mediaUserErrors.length == 0,
    "Error setting product images. Contact Support for help."
  );
};

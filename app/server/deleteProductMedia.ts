import invariant from "tiny-invariant";
import { DELETE_PRODUCT_MEDIA_QUERY } from "./graphql";

export async function deleteProductMedia(
    admin,
    mediaIds: string[],
    productId: string,
) {
    const deleteProductMediaResponse = await admin.graphql(
        DELETE_PRODUCT_MEDIA_QUERY,
        {
            variables: {
                mediaIds: mediaIds,
                productId: productId,
            },
        },
    );
    const deleteProductMediaBody = await deleteProductMediaResponse.json();
    invariant(deleteProductMediaBody.data.productDeleteMedia.mediaUserErrors.length == 0,
        "Error deleting product images. Contact Support for help."
    );
};

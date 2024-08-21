export const DELETE_PRODUCT_MEDIA_QUERY = `#graphql
    mutation deleteProductMedia($mediaIds: [ID!]!, $productId: ID!) {
        productDeleteMedia(mediaIds: $mediaIds, productId: $productId) {
            mediaUserErrors {
                field
                message
            }
        }
    }`;

export const CREATE_PRODUCT_MEDIA_QUERY = `#graphql
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
        productCreateMedia(media: $media, productId: $productId) {
            media {
                alt
                mediaContentType
                status
            }
            mediaUserErrors {
                field
                message
            }
        }
    }`;

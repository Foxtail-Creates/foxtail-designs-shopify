export const CREATE_VARIANTS_QUERY = `#graphql
    mutation createVariants($variants: [ProductVariantsBulkInput!]!, $productId: ID!) {
        productVariantsBulkCreate(variants: $variants, productId: $productId, strategy: REMOVE_STANDALONE_VARIANT) {
            userErrors {
                message
                field
            }
        }
    }`;

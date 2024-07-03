export const CREATE_VARIANT_QUERY = `#graphql
    mutation createVariants($variants: [ProductVariantsBulkInput!]!, $productId: ID!) {
        productVariantsBulkCreate(variants: $variants, productId: $productId) {
            userErrors {
            message
            field
            }
        }
    }`;

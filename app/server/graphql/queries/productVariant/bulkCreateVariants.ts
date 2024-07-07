export const BULK_CREATE_VARIANTS_QUERY = `#graphql
    mutation bulkCreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(
        productId: $productId
        variants: $variants
        strategy: REMOVE_STANDALONE_VARIANT
        ) {
        product {
            id
            options(first: 5) {
            name
            optionValues {
                name
            }
            }
            variants(first: 5) {
            nodes {
                id
                displayName
                selectedOptions {
                name
                value
                optionValue {
                    id
                    name
                }
                }
            }
            }
        }
        userErrors {
            field
            message
        }
        }
    }
`;
export const BULK_CREATE_VARIANTS_QUERY = `#graphql
    mutation bulkCreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(
        productId: $productId
        variants: $variants
        strategy: REMOVE_STANDALONE_VARIANT
        ) {
        product {
            id
            status
            options {
            id
            name
            position
            optionValues {
                id
                name
            }
            }
            variants(first:100) { # TODO: limit number of variants/pagination
            nodes {
                displayName
                id
                price
                inventoryPolicy
                selectedOptions {
                name
                optionValue {
                    id
                    name
                }
                value
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
export const UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY = `#graphql
    mutation updateProductOptionAndVariants($productId: ID!, $optionId: ID!, $newValues: [OptionValueCreateInput!], $oldValues: [ID!]) {
        productOptionUpdate(
            productId: $productId
            option: {id: $optionId}
            optionValuesToAdd: $newValues
            optionValuesToDelete: $oldValues
            variantStrategy: MANAGE
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
    }`;
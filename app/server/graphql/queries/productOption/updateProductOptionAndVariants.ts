export const UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY = `#graphql
    mutation updateProductOptionAndVariants($productId: ID!, $optionName: String!, $optionId: ID!, $newValues: [OptionValueCreateInput!], $oldValues: [ID!],
	    $updatedValues: [OptionValueUpdateInput!]) {
        productOptionUpdate(
            productId: $productId
            option: {id: $optionId, name: $optionName}
            optionValuesToAdd: $newValues
            optionValuesToDelete: $oldValues
            optionValuesToUpdate: $updatedValues
            variantStrategy: MANAGE
        ) {
            product {
                id
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
    }`;
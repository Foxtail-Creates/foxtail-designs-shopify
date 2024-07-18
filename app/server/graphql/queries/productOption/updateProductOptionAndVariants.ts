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
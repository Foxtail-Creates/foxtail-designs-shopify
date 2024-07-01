export const CREATE_PRODUCT_OPTION = `#graphql
    mutation createProductOption($productId: ID!, $position: Int!, $name: String!, $values:[OptionValueCreateInput!] ) { # $flowerOptions: [OptionValueCreateInput!]!
        productOptionsCreate(productId: $productId, options:{
            name:$name,
            position: $position,
            values: $values
        }) {
            userErrors{
            field
            message
            }
        }
    }`;


export const CREATE_VARIANTS = `#graphql
    mutation createVariants($variants: [ProductVariantsBulkInput!]!, $productId: ID!) {
        productVariantsBulkCreate(variants: $variants, productId: $productId) {
            userErrors {
            message
            field
            }
        }
    }`;


export const UPDATE_PRODUCT_OPTION_AND_VARIANTS = `#graphql
    mutation updateProductOptions($productId: ID!, $optionId: ID!, $newValues: [OptionValueCreateInput!], $oldValues: [ID!]) {
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
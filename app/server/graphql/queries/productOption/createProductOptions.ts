export const CREATE_PRODUCT_OPTIONS_QUERY = `#graphql
    mutation createProductOptions($productId: ID!, $position: Int!, $name: String!, $values:[OptionValueCreateInput!] ) { # $flowerOptions: [OptionValueCreateInput!]!
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

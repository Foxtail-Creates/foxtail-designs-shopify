export const CREATE_PRODUCT_OPTIONS_QUERY = `#graphql
    mutation createProductOptions($productId: ID!, $position: Int!, $name: String!, $values:[OptionValueCreateInput!] ) { # $flowerOptions: [OptionValueCreateInput!]!
        productOptionsCreate(productId: $productId, options:{
            name:$name,
            position: $position,
            values: $values
        }) {
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
              variants(first:100) { # TODO: handle large amounts of variants. Make product projection into a fragment
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
            userErrors{
                field
                message
            }
        }
    }`;

export const CREATE_VARIANTS_QUERY = `#graphql
    mutation createVariants($variants: [ProductVariantsBulkInput!]!, $productId: ID!) {
        productVariantsBulkCreate(variants: $variants, productId: $productId, strategy: REMOVE_STANDALONE_VARIANT) {
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
                message
                field
            }
        }
    }`;

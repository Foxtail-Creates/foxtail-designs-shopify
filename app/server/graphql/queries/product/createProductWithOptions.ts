export const CREATE_PRODUCT_WITH_OPTIONS_QUERY= `#graphql
        mutation createProductWithOptions($productName: String!, $productType: String!, $flowerOptionName: String!, $flowerPosition: Int!, $flowerValues: [OptionValueCreateInput!],
          $sizeOptionName: String!, $sizePosition: Int!, $sizeValues: [OptionValueCreateInput!],
          $paletteOptionName: String!, $palettePosition: Int!, $paletteValues: [OptionValueCreateInput!],
          $metafieldNamespace: String!, $metafieldKey: String!, $metafieldValue: String!) {
          productCreate(
            input: {title: $productName,productType: $productType, status: DRAFT,
              productOptions: [
                {name: $flowerOptionName, position: $flowerPosition, values: $flowerValues},
                {name: $sizeOptionName, position: $sizePosition, values: $sizeValues},
                {name: $paletteOptionName, position: $palettePosition, values: $paletteValues},
              ],
              metafields: [
                {namespace: $metafieldNamespace, key: $metafieldKey, value: $metafieldValue, type: "json"}
              ]
            }
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
              message
            }
          }
      }`;


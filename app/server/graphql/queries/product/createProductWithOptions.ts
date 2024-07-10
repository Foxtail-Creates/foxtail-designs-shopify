export const CREATE_PRODUCT_WITH_OPTIONS_QUERY= `#graphql
        mutation createProductWithOptions($productName: String!, $productType: String!, $flowerOptionName: String!, $flowerPosition: Int!, $flowerValues: [OptionValueCreateInput!],
          $sizeOptionName: String!, $sizePosition: Int!, $sizeValues: [OptionValueCreateInput!],
          $paletteOptionName: String!, $palettePosition: Int!, $paletteValues: [OptionValueCreateInput!]) {
          productCreate(
            input: {title: $productName,productType: $productType, status: DRAFT,
              productOptions: [
                {name: $flowerOptionName, position: $flowerPosition, values: $flowerValues},
                {name: $sizeOptionName, position: $sizePosition, values: $sizeValues},
                {name: $paletteOptionName, position: $palettePosition, values: $paletteValues},
              ]
            }
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
            }
            userErrors {
              message
            }
          }
      }`


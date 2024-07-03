export const GET_CUSTOM_PRODUCT_QUERY = `#graphql
    query getCustomProduct($id: ID!) { 
      product(id:$id) {
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
    }`;

export const CREATE_NEW_CUSTOM_PRODUCT_QUERY = `#graphql
        mutation createNewCustomProduct($productName: String!, $productType: String!, $flowerOptionName: String!, $flowerPosition: Int!, $flowerValues: [OptionValueCreateInput!]) {
          productCreate(
            input: {title: $productName, productType: $productType, status: DRAFT, productOptions: [{name: $flowerOptionName, position: $flowerPosition, values: $flowerValues}]}
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


export const SET_PRODUCT_METAFIELD_QUERY = `#graphql
      mutation setNewProductMetafield($productId: ID!, $namespace: String!, $key: String!, $value: String!) {
        metafieldsSet(
            metafields: [{ownerId: $productId, namespace: $namespace, key: $key, type: "json", value: $value}]
        ) {
            userErrors {
              message
          }
        }
    }`;
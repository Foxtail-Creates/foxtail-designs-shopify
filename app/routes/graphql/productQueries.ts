export const GET_CUSTOM_PRODUCT_QUERY = `#graphql
    query getCustomProduct($id: ID!, $variantCount: Int!, $namespace: String!, $key: String!) { 
      product(id:$id) {
        id
        options {
          id
          optionValues {
          name
          }
        }
        metafield(namespace: $namespace, key:$key) {
          id
          value
        }
        variantsCount {
          count
        }
        variants(first:$variantCount) {
          nodes {
          displayName
          id            
          }
        }
      }
    }`;

export const CREATE_NEW_CUSTOM_PRODUCT_QUERY = `#graphql
        mutation createNewCustomProduct($productName: String!, $productType: String!, $variantCount: Int!) {
          productCreate(
            input: {title: $productName, productType: $productType, status: DRAFT}
          ) {
            product {
              id
              options {
                id
                optionValues {
                  name
                }
              }
              variantsCount {
                count
              }
              variants(first: $variantCount) {
                nodes {
                  displayName
                  id
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
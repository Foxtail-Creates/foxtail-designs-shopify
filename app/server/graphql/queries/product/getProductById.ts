export const GET_PRODUCT_BY_ID_QUERY = `#graphql
    query getProductById($id: ID!, $namespace: String!, $key: String!) { 
      product(id:$id) {
        id
        onlineStorePreviewUrl
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
        metafield (namespace: $namespace, key: $key) {
          value
        }
      }
    }`;
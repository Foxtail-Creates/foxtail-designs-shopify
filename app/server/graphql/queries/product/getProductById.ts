export const GET_PRODUCT_BY_ID_QUERY = `#graphql
    query getProductById($id: ID!, $namespace: String!, $key: String!) { 
      product(id:$id) {
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
        media(first:100) {
          nodes {
            id
            mediaContentType
            alt
          }
        }
        variants(first:100) { # TODO: limit number of variants/pagination
          nodes {
            media(first:1) {
              nodes {
                id
              }
            }
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
        metafield (namespace: $namespace, key: $key) {
          value
        }
      }
    }`;

export const GET_PRODUCT_PREVIEW_BY_ID_QUERY = `#graphql
    query getProductPreviewById($id: ID!) { 
      product(id:$id) {
        id
        onlineStorePreviewUrl
      }
    }`;
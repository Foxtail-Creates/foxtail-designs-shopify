export const GET_PRODUCT_BY_ID_QUERY = `#graphql
    query getProductById($id: ID!, $namespace: String!, $key: String!) { 
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
        metafield (namespace: $namespace, key: $key) {
          value
        }
      }
    }`;
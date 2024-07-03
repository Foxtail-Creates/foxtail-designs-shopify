export const GET_PRODUCT_BY_ID_QUERY = `#graphql
    query getProductById($id: ID!) { 
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

export const DELETE_PRODUCT_QUERY= `#graphql
  mutation deleteCustomProduct($productId: ID!) {
    productDelete(input: {id: $productId}) {
      userErrors {
        field
        message
      }
    }
  }`;
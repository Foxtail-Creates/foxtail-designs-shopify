export const ACTIVATE_PRODUCT_QUERY = `#graphql
  mutation activateProduct($id: ID! ) {
    productChangeStatus(productId: $id, status: ACTIVE) {
      userErrors {
        field
        message
      }
    }
  }`;


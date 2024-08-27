export const UPDATE_PRODUCT_QUERY = `#graphql
  mutation updateProduct($productId: ID!, $productName: String!, $productDescription: String!) {
    productUpdate(
      input: {
        id: $productId,
        title: $productName, 
        descriptionHtml: $productDescription
      }
    ) {
      userErrors {
        message
      }
    }
}`;


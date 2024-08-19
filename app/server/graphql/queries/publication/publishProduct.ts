export const PUBLISH_PRODUCT_QUERY = `#graphql
  mutation publishProduct($id:ID!, $publicationId:ID!) {
    publishablePublish(id:$id,
      input: {publicationId: $publicationId}
    ) {
      userErrors {
        message
        field
      }
    }
  }`;
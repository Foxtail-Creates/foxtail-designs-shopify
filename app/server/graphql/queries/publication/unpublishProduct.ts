export const UNPUBLISH_PRODUCT_QUERY = `#graphql
  mutation unpublishProduct($id:ID!, $publicationId:ID!) {
    publishableUnpublish(id:$id,
      input: {publicationId: $publicationId}
    ) {
      userErrors {
        message
        field
      }
    }
  }`;
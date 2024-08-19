export const PUBLISH_PUBLISHABLE_QUERY = `#graphql
  mutation publishPublishable($id:ID!, $publicationId:ID!) {
    publishablePublish(id:$id,
      input: {publicationId: $publicationId}
    ) {
      userErrors {
        message
        field
      }
    }
  }`;
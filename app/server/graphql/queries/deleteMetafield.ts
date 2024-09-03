export const DELETE_METAFIELD_QUERY = `#graphql
  mutation deleteMetafield($metafieldId: ID!) {
    metafieldDelete(input: {id: $metafieldId}) {
      userErrors {
        field
        message
      }
    }
  }`;

export const DELETE_SHOP_METAFIELD_QUERY = `#graphql
  mutation deleteStoreMetafield($metafieldId: ID!) {
    metafieldDelete(input: {id: $metafieldId}) {
      userErrors {
        field
        message
      }
    }
  }`;

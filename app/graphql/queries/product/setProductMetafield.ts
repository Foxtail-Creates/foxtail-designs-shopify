export const SET_PRODUCT_METAFIELD_QUERY = `#graphql
      mutation setProductMetafield($productId: ID!, $namespace: String!, $key: String!, $value: String!) {
        metafieldsSet(
            metafields: [{ownerId: $productId, namespace: $namespace, key: $key, type: "json", value: $value}]
        ) {
            userErrors {
              message
          }
        }
    }`;
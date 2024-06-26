export const SET_NEW_SHOP_METADATA_QUERY = `#graphql
    mutation setNewShopMetafield($shopId: ID!, $productId: String!, $namespace: String!, $key: String!) {
        metafieldsSet(
            metafields: [{ownerId: $shopId, namespace: $namespace, key: $key, type: "string", value: $productId}]
        ) {
        userErrors {
            message
        }
        }
    }`


export const GET_SHOP_METAFIELD_QUERY = `#graphql
    query getShopMetafield($namespace: String!, $key: String!) {
        shop {
            metafield (namespace: $namespace, key: $key) {
                id,
                value
            }
            id
        }
    }`;


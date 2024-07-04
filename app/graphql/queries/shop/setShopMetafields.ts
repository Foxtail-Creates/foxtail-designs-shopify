export const SET_SHOP_METAFIELDS_QUERY = `#graphql
    mutation setShopMetafields($shopId: ID!, $productId: String!, $namespace: String!, $key: String!) {
        metafieldsSet(
            metafields: [{ownerId: $shopId, namespace: $namespace, key: $key, type: "string", value: $productId}]
        ) {
        userErrors {
            message
        }
        }
    }`

export const GET_SHOP_METAFIELD_BY_KEY_QUERY = `#graphql
    query getShopMetafieldByKey($namespace: String!, $key: String!) {
        shop {
            metafield (namespace: $namespace, key: $key) {
                id,
                value
            }
            id
        }
    }`;

import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const GET_PRODUCT_BY_ID_QUERY = `#graphql
    ${PRODUCT_FRAGMENT}
    query getProductById($id: ID!, $namespace: String!, $key: String!) { 
      product(id:$id) {
        ...ProductFields
        metafield (namespace: $namespace, key: $key) {
          value
        }
      }
    }`;

export const GET_PRODUCT_PREVIEW_BY_ID_QUERY = `#graphql
    query getProductPreviewById($id: ID!) { 
      product(id:$id) {
        id
        onlineStorePreviewUrl
        publishedAt
      }
    }`;
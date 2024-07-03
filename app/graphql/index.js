/**
 * Mutations
 * Further info: https://shopify.dev/concepts/graphql/queries
 */
export { GET_PRODUCT_BY_ID_QUERY } from "./product/getProductById";

export { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "./shop/getShopMetafieldByKey";
/**
 * Queries
 * Further info: https://shopify.dev/concepts/graphql/mutations
 */
export { CREATE_VARIANT_QUERY } from "./productVariant/createVariant";
export { BULK_CREATE_VARIANTS_QUERY } from "./productVariant/bulkCreateVariants";

export { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "./product/createProductWithOptions";
export { SET_PRODUCT_METAFIELD_QUERY } from "./product/setProductMetafield";

export { CREATE_PRODUCT_OPTIONS_QUERY } from "./productOption/createProductOptions";
export { UPDATE_PRODUCT_OPTIONS_AND_VARIANTS_QUERY } from "./productOption/updateProductOptionsAndVariants";

export { SET_SHOP_METAFIELDS_QUERY } from "./shop/setShopMetafields";
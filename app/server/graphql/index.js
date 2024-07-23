/**
 * GraphQL Mutations and Queries
 */
export { CREATE_VARIANTS_QUERY } from "./queries/productVariant/createVariant";
export { BULK_CREATE_VARIANTS_QUERY } from "./queries/productVariant/bulkCreateVariants";
export { BULK_UPDATE_VARIANTS_QUERY } from "./queries/productVariant/bulkUpdateVariants";

export { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "./queries/product/createProductWithOptions";
export { SET_PRODUCT_METAFIELD_QUERY } from "./queries/product/setProductMetafield";

export { GET_PRODUCT_BY_ID_QUERY } from "./queries/product/getProductById";
export { CREATE_PRODUCT_OPTIONS_QUERY } from "./queries/productOption/createProductOptions";
export { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./queries/productOption/updateProductOptionAndVariants";

export { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "./queries/shop/getShopMetafieldByKey";
export { SET_SHOP_METAFIELDS_QUERY } from "./queries/shop/setShopMetafields";
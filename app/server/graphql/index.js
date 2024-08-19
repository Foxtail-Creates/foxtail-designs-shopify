/**
 * GraphQL Mutations and Queries
 */
export { CREATE_VARIANTS_QUERY } from "./queries/productVariant/createVariant";
export { BULK_CREATE_VARIANTS_QUERY } from "./queries/productVariant/bulkCreateVariants";
export { BULK_UPDATE_VARIANTS_QUERY } from "./queries/productVariant/bulkUpdateVariants";

export { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "./queries/product/createProductWithOptions";
export { SET_PRODUCT_METAFIELD_QUERY } from "./queries/product/setProductMetafield";
export { ACTIVATE_PRODUCT_QUERY } from "./queries/product/activateProduct"
export { GET_PRODUCT_BY_ID_QUERY } from "./queries/product/getProductById";
export { CREATE_PRODUCT_OPTIONS_QUERY } from "./queries/productOption/createProductOptions";
export { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./queries/productOption/updateProductOptionAndVariants";
export { DELETE_PRODUCT_QUERY } from "./queries/product/deleteProduct";

export { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "./queries/shop/getShopMetafieldByKey";
export { SET_SHOP_METAFIELDS_QUERY } from "./queries/shop/setShopMetafields";
export { DELETE_SHOP_METAFIELD_QUERY } from "./queries/shop/deleteShopMetafield";

export { CREATE_PRODUCT_MEDIA_QUERY } from "./queries/product/createProductMedia";
export { DELETE_PRODUCT_MEDIA_QUERY } from "./queries/product/deleteProductMedia";

export { GET_PUBLICATIONS_QUERY } from "./queries/publication/getPublications";
export { PUBLISH_PUBLISHABLE_QUERY } from "./queries/publication/publishPublishable";
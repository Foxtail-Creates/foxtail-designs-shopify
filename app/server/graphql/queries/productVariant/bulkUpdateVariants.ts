import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const BULK_UPDATE_VARIANTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation bulkUpdateVariants($productId: ID!, $variantsToBulkUpdate: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(
      productId: $productId
      variants: $variantsToBulkUpdate
    ) {
      product {
        ...ProductFields
      }
      userErrors {
        field
        message
      }
    }
  }`;
  
import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const CREATE_VARIANTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation createVariants($variants: [ProductVariantsBulkInput!]!, $productId: ID!) {
    productVariantsBulkCreate(variants: $variants, productId: $productId, strategy: REMOVE_STANDALONE_VARIANT) {
      product {
        ...ProductFields
        
      }
      userErrors {
        message
        field
      }
    }
  }`;

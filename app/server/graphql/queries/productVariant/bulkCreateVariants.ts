import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const BULK_CREATE_VARIANTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation bulkCreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(
    productId: $productId
    variants: $variants
    strategy: REMOVE_STANDALONE_VARIANT
    ) {
    product {
      ...ProductFields
    }
    userErrors {
      field
      message
    }
    }
  }
`;
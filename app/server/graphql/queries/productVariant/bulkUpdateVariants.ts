export const BULK_UPDATE_VARIANTS_QUERY = `#graphql
  mutation bulkUpdateVariants($productId: ID!, $variantsToBulkUpdate: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(
      productId: $productId
      variants: $variantsToBulkUpdate
    ) {
      userErrors {
        field
        message
      }
    }
  }`;
  
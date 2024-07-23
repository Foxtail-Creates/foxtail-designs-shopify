export const BULK_UPDATE_VARIANTS_QUERY = `#graphql
  mutation bulkUpdateVariants($productId: ID!, $variantsToBulkUpdate: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(
      productId: $productId
      variants: $variantsToBulkUpdate
    ) {
      product {
        id
        options {
          id
          name
          position
          optionValues {
            id
            name
          }
        }
        variants(first:100) { # TODO: limit number of variants/pagination
          nodes {
            displayName
            id
            price
            selectedOptions {
              name
              optionValue {
                id
                name
              }
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;
  
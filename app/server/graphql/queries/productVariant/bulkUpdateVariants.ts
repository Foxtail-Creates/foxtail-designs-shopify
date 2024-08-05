export const BULK_UPDATE_VARIANTS_QUERY = `#graphql
  mutation bulkUpdateVariants($productId: ID!, $variantsToBulkUpdate: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(
      productId: $productId
      variants: $variantsToBulkUpdate
    ) {
      product {
        id
        status
        options {
          id
          name
          position
          optionValues {
            id
            name
          }
        }
        media(first:100) {
          nodes {
            id
            mediaContentType
            alt
          }
        }    
        variants(first:100) { # TODO: limit number of variants/pagination
          nodes {
            media(first:1) {
              nodes {
                id
              }
            }
            displayName
            id
            price
            inventoryPolicy
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
  
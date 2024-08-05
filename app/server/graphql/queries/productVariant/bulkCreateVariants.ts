export const BULK_CREATE_VARIANTS_QUERY = `#graphql
  mutation bulkCreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(
    productId: $productId
    variants: $variants
    strategy: REMOVE_STANDALONE_VARIANT
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
  }
`;
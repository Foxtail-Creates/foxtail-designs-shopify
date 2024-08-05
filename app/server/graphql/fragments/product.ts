export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFields on Product {
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
  }` as const;
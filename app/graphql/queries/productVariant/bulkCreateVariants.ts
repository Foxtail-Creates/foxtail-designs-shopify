export const BULK_CREATE_VARIANTS_QUERY = `#graphql
    mutation bulkCreateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(
        productId: $productId
        variants: $variants
        strategy: REMOVE_STANDALONE_VARIANT
        ) {
        product {
            id
            options(first: 5) {
            name
            optionValues {
                name
            }
            }
            variants(first: 5) {
            nodes {
                id
                displayName
                selectedOptions {
                name
                value
                optionValue {
                    id
                    name
                }
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

// {
//   "productId": "gid://shopify/Product/8287627870362",
//   "variants": [
//     {
//       "optionValues": [
//         {
//           "name": "Daisy",
//           "optionName": "focal flower"
//         },
//         {
//           "name": "v1",
//           "optionName": "new option with many values"
//         },
//         {
//           "name": "name1",
//           "optionName": "new option"
//         }
//       ]
//     }
//   ]
// }
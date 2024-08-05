import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation updateProductOptionAndVariants($productId: ID!, $optionName: String!, $optionId: ID!, $newValues: [OptionValueCreateInput!], $oldValues: [ID!],
	  $updatedValues: [OptionValueUpdateInput!]) {
      productOptionUpdate(
        productId: $productId
          option: {id: $optionId, name: $optionName}
          optionValuesToAdd: $newValues
          optionValuesToDelete: $oldValues
          optionValuesToUpdate: $updatedValues
          variantStrategy: MANAGE
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
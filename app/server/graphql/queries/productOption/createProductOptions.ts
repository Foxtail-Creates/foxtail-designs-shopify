import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const CREATE_PRODUCT_OPTIONS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation createProductOptions($productId: ID!, $position: Int!, $name: String!, $values:[OptionValueCreateInput!] ) { # $flowerOptions: [OptionValueCreateInput!]!
    productOptionsCreate(productId: $productId, options:{
      name:$name,
      position: $position,
      values: $values
  }) {
    product {
      ...ProductFields
    }
    userErrors{
        field
        message
    }
  }
}`;

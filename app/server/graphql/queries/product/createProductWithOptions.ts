import { PRODUCT_FRAGMENT } from "../../fragments/product";

export const CREATE_PRODUCT_WITH_OPTIONS_QUERY= `#graphql
  ${PRODUCT_FRAGMENT}
  mutation createProductWithOptions($productName: String!, $productDescription: String!, $productType: String!, $flowerOptionName: String!, $flowerPosition: Int!, $flowerValues: [OptionValueCreateInput!],
    $sizeOptionName: String!, $sizePosition: Int!, $sizeValues: [OptionValueCreateInput!],
    $paletteOptionName: String!, $palettePosition: Int!, $paletteValues: [OptionValueCreateInput!],
    $metafieldNamespace: String!, $metafieldKey: String!, $metafieldValue: String!,
    $seoInput: SEOInput
  ) {
    productCreate(
      input: {title: $productName, descriptionHtml: $productDescription, productType: $productType, status: ACTIVE,
        productOptions: [
          {name: $sizeOptionName, position: $sizePosition, values: $sizeValues},
          {name: $paletteOptionName, position: $palettePosition, values: $paletteValues},
          {name: $flowerOptionName, position: $flowerPosition, values: $flowerValues}
        ],
        seo: $seoInput,
        metafields: [
          {namespace: $metafieldNamespace, key: $metafieldKey, value: $metafieldValue, type: "json"}
        ]
      }
    ) {
      product {
        ...ProductFields
      }
      userErrors {
        message
      }
    }
}`;


import { FLOWER_OPTION_NAME, FLOWER_POSITION, SIZE_OPTION_NAME, SIZE_POSITION, PALETTE_OPTION_NAME, PALETTE_POSITION, FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED } from "~/constants";
import { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "../graphql";

/**
 * Creates a new product
 */
export async function createProduct(admin, optionToName: { [key: string]: string },
  flowerValues: [{ [key: string]: string }], sizeValues: [{ [key: string]: string }], paletteValues: [{ [key: string]: string }]) {
  const customProductWithOptionsResponse = await admin.graphql(
    CREATE_PRODUCT_WITH_OPTIONS_QUERY,
    {
      variables: {
        productName: "Custom Bouquet",
        productType: "Custom Flowers",
        flowerOptionName: optionToName[FLOWER_OPTION_NAME],
        flowerPosition: FLOWER_POSITION,
        flowerValues: flowerValues,
        sizeOptionName: optionToName[SIZE_OPTION_NAME],
        sizePosition: SIZE_POSITION,
        sizeValues: sizeValues,
        paletteOptionName: optionToName[PALETTE_OPTION_NAME],
        palettePosition: PALETTE_POSITION,
        paletteValues: paletteValues,
        metafieldNamespace: FOXTAIL_NAMESPACE,
        metafieldKey: PRODUCT_METADATA_PRICES,
        metafieldValue: PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED
      },
    },
  );

  const customProductWithOptionsBody = await customProductWithOptionsResponse.json();

  const hasErrors: boolean = customProductWithOptionsBody.data?.productCreate.userErrors.length != 0;
  if (hasErrors) {
    console.log("Error creating new product. Message {"
      + customProductWithOptionsBody.data.productCreate.userErrors[0].message
      + "} on field {"
      + customProductWithOptionsBody.data.productCreate.userErrors[0].field
      + "}");
    throw "Error creating new product. Contact Support for help.";
  }

  return customProductWithOptionsBody.data.productCreate.product;
}
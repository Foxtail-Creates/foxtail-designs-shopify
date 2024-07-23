import { FLOWER_OPTION_NAME, FLOWER_POSITION, SIZE_OPTION_NAME, SIZE_POSITION, PALETTE_OPTION_NAME, PALETTE_POSITION, FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED } from "~/constants";
import { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "./graphql";
import { createVariants } from "./createVariants";

/**
 * Creates a new product
 */
export async function createProductWithOptionsAndVariants(admin, selectedFlowers: string[], optionToName: { [key: string]: string},
  selectedPalettes: string[], selectedSizes: string[], sizeToPrice: { [key: string]: number }, flowerToPrice: { [key: string]: number }) {
    const customProductResponse = await admin.graphql(
      CREATE_PRODUCT_WITH_OPTIONS_QUERY,
      {
        variables: {
          productName: "Custom Bouquet",
          productType: "Custom Flowers",
          flowerOptionName: optionToName[FLOWER_OPTION_NAME],
          flowerPosition: FLOWER_POSITION,
          flowerValues: selectedFlowers.map((value: string) => ({ "name": value })),
          sizeOptionName: optionToName[SIZE_OPTION_NAME],
          sizePosition: SIZE_POSITION,
          sizeValues: selectedSizes.map((value: string) => ({ "name": value })),
          paletteOptionName: optionToName[PALETTE_OPTION_NAME],
          palettePosition: PALETTE_POSITION,
          paletteValues: selectedPalettes.map((value: string) => ({ "name": value })),
          metafieldNamespace: FOXTAIL_NAMESPACE,
          metafieldKey: PRODUCT_METADATA_PRICES,
          metafieldValue: PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED
        },
      },
    );

    const customProductBody = await customProductResponse.json();

    const hasErrors: boolean = customProductBody.data?.productCreate.userErrors.length != 0;
    if (hasErrors) {
        console.log("Error creating new product. Message {"
            + customProductBody.data?.productCreate.userErrors[0].message
            + "} on field {"
            + customProductBody.data?.productCreate.userErrors[0].field
            + "}");
        throw "Error creating new product. Contact Support for help.";
    }

    await createVariants(admin, customProductBody.data.productCreate.product.id, selectedFlowers, selectedSizes, selectedPalettes, sizeToPrice, flowerToPrice, optionToName);
    return customProductBody.data.productCreate.product;
  }
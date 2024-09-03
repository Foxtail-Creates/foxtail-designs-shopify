import { FLOWER_OPTION_NAME, FLOWER_POSITION, SIZE_OPTION_NAME, SIZE_POSITION, PALETTE_OPTION_NAME, PALETTE_POSITION, FOXTAIL_NAMESPACE, PRODUCT_METADATA_CUSTOM_OPTIONS, PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED, PRODUCT_NAME, PRODUCT_DESCRIPTION } from "~/constants";
import { CREATE_PRODUCT_WITH_OPTIONS_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { ProductFieldsFragment } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { CreateProductWithOptionsMutation } from "~/types/admin.generated";

/**
 * Creates a new product
 */
export async function createProduct(
  admin: AdminApiContext,
  optionToName: { [key: string]: string },
  flowerValues: [{ [key: string]: string }],
  sizeValues: [{ [key: string]: string }],
  paletteValues: [{ [key: string]: string }]
): Promise<ProductFieldsFragment | undefined | null> {

  const customProductWithOptionsBody: FetchResponseBody<CreateProductWithOptionsMutation> = await sendQuery(
    admin,
    CREATE_PRODUCT_WITH_OPTIONS_QUERY,
    {
      variables: {
        productName: PRODUCT_NAME,
        productDescription: PRODUCT_DESCRIPTION,
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
        metafieldKey: PRODUCT_METADATA_CUSTOM_OPTIONS,
        metafieldValue: PRODUCT_METADATA_DEFAULT_VALUES_SERIALIZED
      },
    }
  );

  const hasErrors: boolean = customProductWithOptionsBody.data?.productCreate?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error activating product.\n User errors: { "
      + JSON.stringify(customProductWithOptionsBody.data?.productCreate?.userErrors)
      + "}");
  }

  return customProductWithOptionsBody.data?.productCreate?.product;
}
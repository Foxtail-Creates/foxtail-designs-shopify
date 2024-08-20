import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "../graphql";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { ProductFieldsFragment, UpdateProductOptionAndVariantsMutation } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";

export async function updateProductOptionsAndVariants(
  admin: AdminApiContext,
  productId: string,
  optionName: string,
  optionId: string,
  valuesToAdd,
  idsToRemove,
  valuesToUpdate
): Promise<ProductFieldsFragment | null | undefined> {

  const updateProductOptionNameBody: FetchResponseBody<UpdateProductOptionAndVariantsMutation> = await sendQuery(
    admin,
    UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
    {
      variables: {
        productId: productId,
        optionName: optionName,
        optionId: optionId,
        newValues: valuesToAdd,
        oldValues: idsToRemove,
        updatedValues: valuesToUpdate
      },
    },
  );

  const hasErrors: boolean = updateProductOptionNameBody.data?.productOptionUpdate?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error updating variants.\n User errors: { "
      + updateProductOptionNameBody.data?.productOptionUpdate?.userErrors
      + "}");
  }
  return updateProductOptionNameBody.data?.productOptionUpdate?.product;
}

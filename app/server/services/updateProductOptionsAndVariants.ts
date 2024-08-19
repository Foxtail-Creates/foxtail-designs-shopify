import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "../graphql";

export async function updateProductOptionsAndVariants(
  admin,
  productId: string,
  optionName: string,
  optionId: string,
  valuesToAdd,
  idsToRemove,
  valuesToUpdate
) {

  const updateProductOptionNameResponse = await admin.graphql(
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

  const updateProductOptionNameBody = await updateProductOptionNameResponse.json();
  const hasErrors: boolean = updateProductOptionNameBody.data?.productOptionUpdate.userErrors.length != 0;
  if (hasErrors) {
    console.log("Error updating variants. Message {"
      + updateProductOptionNameBody.data?.productOptionUpdate.userErrors[0].message
      + "} on field {"
      + updateProductOptionNameBody.data?.productOptionUpdate.userErrors[0].field
      + "}");
    throw "Error renaming option. Contact Support for help.";
  }
  return updateProductOptionNameBody.data.productOptionUpdate.product;
}

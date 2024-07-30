import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./graphql";

export async function updateOptionName(
  admin,
  product,
  currentOptionName: string,
  newDisplayName: string,
) {

  const option = product.options.find(
    (o) => o.name === currentOptionName,
) ;
  const updateProductOptionNameResponse = await admin.graphql(
    UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
    {
      variables: {
        productId: product.id,
        optionName: newDisplayName,
        optionId: option.id,
        newValues: [],
        oldValues: [],
        updatedValues: []
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
}

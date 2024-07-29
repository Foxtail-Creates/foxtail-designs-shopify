import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./graphql";

export async function updateOptionAndValueNames(
  admin,
  product,
  currentOptionName: string,
  newDisplayName: string,
  optionValueToNameUpdates: { [key: string]: string }
) {

  const option = product.options.find(
    (o) => o.name === currentOptionName,
  );

  // get shopifyIds
  const updatedOptions: { [key: string]: string } = option
    ? option.optionValues.reduce(function (variants: [{[key: string]: string }] , optionValue) {
      variants.push({
        id: optionValue.id,
        name: optionValueToNameUpdates[optionValue.name] != null ? optionValueToNameUpdates[optionValue.name] : optionValue.name
      });
      return variants;
    }, [])
    : [];



  const updateProductOptionNameResponse = await admin.graphql(
    UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
    {
      variables: {
        productId: product.id,
        optionName: newDisplayName,
        optionId: option.id,
        newValues: [],
        oldValues: [],
        updatedValues: updatedOptions
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

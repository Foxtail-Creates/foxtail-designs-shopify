import { updateProductOptionsAndVariants } from "../services/updateProductOptionsAndVariants";

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


  const updatedProduct = await updateProductOptionsAndVariants(admin, product.id,
    newDisplayName, option.id, [], [], updatedOptions);
  return updatedProduct;
}

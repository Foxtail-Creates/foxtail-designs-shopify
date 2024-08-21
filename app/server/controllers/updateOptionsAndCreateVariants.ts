import { ProductFieldsFragment } from "~/types/admin.generated";
import { createProductOptions } from "../services/createProductOptions";
import { updateProductOptionsAndVariants } from "../services/updateProductOptionsAndVariants";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export async function updateOptionsAndCreateVariants(
  admin: AdminApiContext,
  product: ProductFieldsFragment,
  optionName: string,
  optionPosition: number,
  optionIdsToRemove: string[],
  optionIdsToAdd: string[],
  optionIdsSelected: string[],
  getOptionValueName: (value: string) => string
) {
  const option = product.options.find(
    (o) => o.name === optionName,
  );

  const optionValueNameToShopifyId: { [key: string]: string } = option
    ? option.optionValues.reduce(function (map: { [key: string]: string }, optionValue) {
      map[optionValue.name] = optionValue.id;
      return map;
    }, {})
    : {};

  const shopifyIdsToRemove: string[] = [];

  optionIdsToRemove.forEach((backendId: string) => {
    const optionValueName = getOptionValueName(backendId);

    if (Object.prototype.hasOwnProperty.call(optionValueNameToShopifyId, optionValueName)) {
      shopifyIdsToRemove.push(optionValueNameToShopifyId[optionValueName]);
    }
  });
  const optionValuesToAdd = optionIdsToAdd.map(
    (optionBackendId: string) => ({
      name: getOptionValueName(optionBackendId)
    })
  );

  const optionValuesSelected = optionIdsSelected.map(
    (optionBackendId: string) => ({
      name: getOptionValueName(optionBackendId)
    })
  );
  if (option == null && optionIdsSelected.length > 0) {
    // if flower option is missing, recover by creating a new option and variants from all flowers selected
    await createProductOptions(admin, product.id, optionPosition, optionName, optionValuesSelected);
  } else if (
    option != undefined &&
    optionIdsToRemove.length > 0 ||
    optionValuesToAdd.length > 0
  ) {
    await updateProductOptionsAndVariants(admin, product.id, optionName, option.id,
      optionValuesToAdd, shopifyIdsToRemove, []);
  }
}

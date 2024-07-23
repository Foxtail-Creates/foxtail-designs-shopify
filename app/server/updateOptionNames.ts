import invariant from "tiny-invariant";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./graphql";

export async function updateOptionName(
  admin,
  product,
  currentOptionName: string,
  newDisplayName: string,
) {

  // custom option - alias
  // - option names
  // - option values
  // - save
  //   - option name to displayName map
  //   - option value to displayName map
  // const optionUpdates = [];
  // for (const option in optionToDisplayName) {
  //     optionUpdates.push({
  //         id: 
  //     })
  // }

  // todo: don't update it name is the same
  const option = product.options.find(
    (o) => o.name === currentOptionName,
) ;
  const updateProductOptionNameResponse = await admin.graphql(
    UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
    {
      variables: {
        productId: product.id,
        optionName: newDisplayName,
        optionId: option.optionId,
        newValues: [],
        oldValues: [],
        updatedValues: []
      },
    },
  );

  const updateProductOptionNameBody = await updateProductOptionNameResponse.json();
  invariant(updateProductOptionNameBody.data?.productOptionUpdate?.userErrors.length == 0,
    "Error renaming new product options. Contact Support for help."
  );
}

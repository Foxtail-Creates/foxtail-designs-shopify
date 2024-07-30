import { CREATE_PRODUCT_OPTIONS_QUERY } from "./graphql";
import invariant from "tiny-invariant";
import { TwoWayFallbackMap } from "./TwoWayFallbackMap";

export async function createProductOptions(
  admin,
  productId,
  position,
  name,
  values
) {
  const createProductOptionsResponse = await admin.graphql(
    CREATE_PRODUCT_OPTIONS_QUERY,
    {
      variables: {
        productId: productId,
        position: position,
        name: name,
        values: values.map((value: string) => ({ "name": value }))
      },
    },
  );
  const createProductOptionsBody = await createProductOptionsResponse.json();
  invariant(createProductOptionsBody.data.productOptionsCreate.userErrors.length == 0,
    "Error creating new product options. Contact Support for help."
  );
};

export async function getSelectedCustomValues(admin, option, customProduct, position: number,
  optionName: string, defaultValues: string[], backendIdToName: TwoWayFallbackMap): Promise<string[]> {
  if (option == null) {
    // create new product option and variants
    await createProductOptions(
      admin,
      customProduct.id,
      position,
      optionName,
      defaultValues
    );
    return defaultValues;
  } else {
    return option.optionValues.map(
      (optionValue) => (backendIdToName.getReverseValue(optionValue.name))
    );
  }
};

export async function getSelectedValues(admin, option, customProduct, position: number, optionName: string, defaultValues: string[]): Promise<string[]> {
  if (option == null) {
    // create new product option and variants
    await createProductOptions(
      admin,
      customProduct.id,
      position,
      optionName,
      defaultValues
    );
    return defaultValues;
  } else {
    return option.optionValues.map(
      (optionValue) => optionValue.name
    );
  }
};
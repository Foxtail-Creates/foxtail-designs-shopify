import { CREATE_PRODUCT_OPTIONS_QUERY } from "./graphql";
import invariant from "tiny-invariant";

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

export async function getSelectedValues(admin, option, responseBody, position, optionName, defaultValues) : Promise<string[]> {
    if (option == null) {
    // create new product option and variants
      await createProductOptions(
        admin,
        responseBody.data?.product.id,
        position,
        optionName,
        defaultValues
      );
      return defaultValues;
    } else {
      return option.optionValues.map(
        (optionValue) => optionValue.name,
      );
    }
  };
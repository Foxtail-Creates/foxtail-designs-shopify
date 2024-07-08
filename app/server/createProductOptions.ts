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

    // const createVariantsResponse = await admin.graphql(
    //     CREATE_VARIANTS_QUERY,
    //     {
    //         variables: {
    //             productId: productId,
    //             variants: [
    //                 {
    //                     optionValues: values.map(
    //                         (value: string) => (
    //                             {
    //                                 name: value,
    //                                 optionName: FLOWER_OPTION_NAME
    //                             }
    //                         )
    //                     )
    //                 }
    //             ]

    //         }
    //     }
    // );

    // const createVariantsBody = await createVariantsResponse.json();

    // invariant(createVariantsBody.data.productOptionsCreate.userErrors.length == 0,
    //     "Error creating new variant. Contact Support for help."
    // );
};

export async function createOptionWithValues(admin, option, responseBody, position, optionName, defaultValues) : Promise<string[]> {
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
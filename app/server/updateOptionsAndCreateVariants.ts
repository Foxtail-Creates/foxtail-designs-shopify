import invariant from "tiny-invariant";
import { createProductOptions } from "./createProductOptions";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./graphql";

export async function updateOptionsAndCreateVariants(
    admin,
    product,
    optionName: string,
    optionPosition: number,
    optionValuesToRemove: string[],
    optionValuesToAdd: string[],
    optionValuesSelected: string[]
) {
    const option = product.options.find(
        (o) => o.name === optionName,
    );

    const optionValueNameToId: Map<string, string> = option
        ? option.optionValues.reduce(function (map, optionValue) {
            map.set(optionValue.name, optionValue.id);
            return map;
        }, new Map<string, string>())
        : new Map<string, string>();

    const valueIdsToRemove: string[] = [];

    optionValuesToRemove.forEach((optionValueName: string) => {
        if (optionValueNameToId.has(optionValueName)) {
            valueIdsToRemove.push(optionValueNameToId.get(optionValueName));
        }
    });

    if (option == null && optionValuesSelected.length > 0) {
        // if flower option is missing, recover by creating a new option and variants from all flowers selected
        createProductOptions(admin, product.id, optionPosition, optionName, optionValuesSelected);
        // todo: create variants
    } else if (
        option != undefined &&
        optionValuesToRemove.length > 0 ||
        optionValuesToAdd.length > 0
    ) {
        const updateProductOptionAndVariantsResponse = await admin.graphql(
            UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
            {
                variables: {
                    productId: product.id,
                    optionName: option.name,
                    optionId: option.id,
                    newValues: optionValuesToAdd.map(
                        (optionValueName: string) => ({ name: optionValueName })
                    ),
                    oldValues: valueIdsToRemove,
                    updatedValues: []
                },
            },
        );

        // todo: validation

        const updateProductOptionBody = await updateProductOptionAndVariantsResponse.json();
        invariant(updateProductOptionBody.data?.productOptionUpdate?.userErrors.length == 0,
            "Error creating new product options. Contact Support for help."
        );
    }
}

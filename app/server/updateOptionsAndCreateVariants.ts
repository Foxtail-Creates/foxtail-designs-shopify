import { createProductOptions } from "./createProductOptions";
import { UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY } from "./graphql";

export async function updateOptionsAndCreateVariants(
    admin,
    product,
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
        createProductOptions(admin, product.id, optionPosition, optionName, optionValuesSelected);
        // todo: create variants
    } else if (
        option != undefined &&
        optionIdsToRemove.length > 0 ||
        optionValuesToAdd.length > 0
    ) {
        const updateProductOptionAndVariantsResponse = await admin.graphql(
            UPDATE_PRODUCT_OPTION_AND_VARIANTS_QUERY,
            {
                variables: {
                    productId: product.id,
                    optionName: option.name,
                    optionId: option.id,
                    newValues: optionValuesToAdd,
                    oldValues: shopifyIdsToRemove,
                    updatedValues: []
                },
            },
        );

        const updateProductOptionBody = await updateProductOptionAndVariantsResponse.json();

        const hasErrors: boolean = updateProductOptionBody.data?.productOptionUpdate?.userErrors.length != 0;

        if (hasErrors) {
            console.log("Error creating new product options. Message {"
                + updateProductOptionBody.data?.productOptionUpdate.userErrors[0].message
                + "} on field {"
                + updateProductOptionBody.data?.productOptionUpdate.userErrors[0].field
                + "}");
            throw "Error creating new product options. Contact Support for help.";
        }
    }
}

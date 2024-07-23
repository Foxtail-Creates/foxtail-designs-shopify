import { DEFAULT_FLOWER_PRICE, FLOWER_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { BULK_UPDATE_VARIANTS_QUERY } from "./graphql/queries/productVariant/bulkUpdateVariants";
import { ProductMetadata } from "~/types";

export async function updateVariants(
    admin,
    productId: string,
    variantNodes,
    productMetadata: ProductMetadata,
    sizeToPriceUpdates: { [key:string]: number},
    flowerToPriceUpdates: { [key:string]: number},
 ) {
    const newVariants = [];
    // for all variants, if flower or size options are in the update maps, recalculate price
    variantNodes.forEach( (variantNode) => {
        const sizeName: string = variantNode.selectedOptions.find((option) => option.name == productMetadata.optionToName[SIZE_OPTION_NAME]).value;
        const shouldUpdateSizePrice: boolean = Object.prototype.hasOwnProperty.call(sizeToPriceUpdates, sizeName);
        const defaultSizePrice: number = Object.prototype.hasOwnProperty.call(productMetadata.sizeToPrice, sizeName)
            ? productMetadata.sizeToPrice[sizeName]
            : SIZE_TO_PRICE_DEFAULT_VALUES[sizeName];

        const flowerName: string = variantNode.selectedOptions.find((option) => option.name == productMetadata.optionToName[FLOWER_OPTION_NAME]).value;
        const shouldUpdateFlowerPrice: boolean = Object.prototype.hasOwnProperty.call(flowerToPriceUpdates, flowerName);
        const defaultFlowerPrice: number = Object.prototype.hasOwnProperty.call(productMetadata.flowerToPrice, flowerName)
            ? productMetadata.flowerToPrice[flowerName]
            : DEFAULT_FLOWER_PRICE;

        if (shouldUpdateSizePrice || shouldUpdateFlowerPrice) {
            const sizePrice = shouldUpdateSizePrice ? sizeToPriceUpdates[sizeName] : defaultSizePrice;
            const flowerPrice = shouldUpdateFlowerPrice ? flowerToPriceUpdates[flowerName] : defaultFlowerPrice;
            newVariants.push({
                id: variantNode.id,
                price: (sizePrice + flowerPrice).toString()
            })
        }   
    });
    

    const updateVariantsResponse = await admin.graphql(
        BULK_UPDATE_VARIANTS_QUERY,
        {
            variables: {
                productId: productId,
                variantsToBulkUpdate: newVariants
            }
        }
    );
    const updateVariantsBody = await updateVariantsResponse.json();

    const hasErrors: boolean = updateVariantsBody.data?.productVariantsBulkUpdate.userErrors.length != 0;
    if (hasErrors) {
        console.log("Error updating variants. Message {"
            + updateVariantsBody.data?.productVariantsBulkUpdate.userErrors[0].message
            + "} on field {"
            + updateVariantsBody.data?.productVariantsBulkUpdate.userErrors[0].field
            + "}");
        throw "Error updating variants. Contact Support for help.";
    }
}

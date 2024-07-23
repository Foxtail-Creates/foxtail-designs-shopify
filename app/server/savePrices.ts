import { FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES } from "~/constants";
import { updateVariants } from "./updateVariants";
import { setProductMetadata } from "./setProductMetadata";

export async function savePrices(
    admin,
    productId: string,
    variantNodes,
    sizeToPrice: { [key:string]: number },
    sizeToPriceUpdates: { [key:string]: number },
    flowerToPrice: { [key:string]: number },
    flowerToPriceUpdates: { [key:string]: number }
) {

    await updateVariants(admin, productId, variantNodes, sizeToPrice, sizeToPriceUpdates, flowerToPrice, flowerToPriceUpdates);

    updatePriceMap(sizeToPrice, sizeToPriceUpdates);
    updatePriceMap(flowerToPrice, flowerToPriceUpdates);

    // use the updated prices to save in the product price metadata maps
    await setProductMetadata(admin, productId,
        FOXTAIL_NAMESPACE, PRODUCT_METADATA_PRICES, JSON.stringify({sizeToPrice: sizeToPrice, flowerToPrice: flowerToPrice}));
    
}

export function updatePriceMap(original: { [key:string]: number }, updates: { [key:string]: number }) {
    for (const optionValue in updates) {
        original[optionValue] = updates[optionValue];
    }
}
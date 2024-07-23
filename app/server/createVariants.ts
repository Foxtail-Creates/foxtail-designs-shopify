import { DEFAULT_FLOWER_PRICE, FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { CREATE_VARIANTS_QUERY } from "./graphql";
import invariant from "tiny-invariant";

export async function createVariants(
    admin,
    productId: string,
    flowerValues: string[],
    flowerOptionName: string,
    sizeValues: string[],
    paletteValues: string[],
    sizeToPrice: { [key: string]: number },
    flowerToPrice: { [key: string]: number }
 ) {
    const variants = [];
    for (let f = 0; f < flowerValues.length; f++) {
        for (let s = 0; s < sizeValues.length; s++) {
            for(let p = 0; p < paletteValues.length; p++) {
                const sizePrice: number = Object.prototype.hasOwnProperty.call(sizeToPrice, sizeValues[s])
                    ?  sizeToPrice[sizeValues[s]]
                    : SIZE_TO_PRICE_DEFAULT_VALUES[sizeValues[s]]
                const flowerPrice: number = Object.prototype.hasOwnProperty.call(flowerToPrice, flowerValues[f])
                ?  flowerToPrice[flowerValues[s]]
                : DEFAULT_FLOWER_PRICE
                variants.push({
                    optionValues: [
                        {
                            optionName: flowerOptionName,
                            name: flowerValues[f]
                        },
                        {
                            optionName: SIZE_OPTION_NAME,
                            name: sizeValues[s]
                        },
                        {
                            optionName: PALETTE_OPTION_NAME,
                            name: paletteValues[p]
                        }
                    ],
                    price: (sizePrice + flowerPrice).toString()
                })
            }
            
        }
    }

    const createVariantsResponse = await admin.graphql(
        CREATE_VARIANTS_QUERY,
        {
            variables: {
                productId: productId,
                variants: variants

            }
        }
    );
    const createVariantsBody = await createVariantsResponse.json();

    invariant(createVariantsBody.data?.productVariantsBulkCreate.userErrors.length == 0,
        "Error creating new variant. Contact Support for help."
    );
    return createVariantsBody.data.productVariantsBulkCreate.product;
}
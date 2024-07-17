import { FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { CREATE_VARIANTS_QUERY } from "./graphql";
import invariant from "tiny-invariant";

export async function createVariants(
    admin,
    productId: string,
    flowerValues: string[],
    sizeValues: string[],
    paletteValues: string[],
    sizeToPrice: object
 ) {
    const variants = [];
    for (let f = 0; f < flowerValues.length; f++) {
        for (let s = 0; s < sizeValues.length; s++) {
            for(let p = 0; p < paletteValues.length; p++) {
                const unitPrice = Object.prototype.hasOwnProperty.call(sizeToPrice, sizeValues[s])
                    ?  sizeToPrice[sizeValues[s]].toString()
                    : SIZE_TO_PRICE_DEFAULT_VALUES[sizeValues[s]].toString();
                variants.push({
                    optionValues: [
                        {
                            optionName: FLOWER_OPTION_NAME,
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
                    price: unitPrice
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
}
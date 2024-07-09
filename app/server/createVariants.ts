import { FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME } from "~/constants";
import { CREATE_VARIANTS_QUERY } from "./graphql";
import invariant from "tiny-invariant";

export async function createVariants(
    admin,
    productId: string,
    flowerValues: string[],
    sizeValues: string[],
    paletteValues: string[]
 ) {
    const variants = [];
    for (let f = 0; f < flowerValues.length; f++) {
        for (let s = 0; s < sizeValues.length; s++) {
            for(let p = 0; p < paletteValues.length; p++) {
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
                    ]
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

    invariant(createVariantsBody.data.productOptionsCreate.userErrors.length == 0,
        "Error creating new variant. Contact Support for help."
    );
}
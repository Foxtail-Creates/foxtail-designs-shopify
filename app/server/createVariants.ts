import { FLOWER_OPTION_NAME, SIZE_OPTION_NAME } from "~/constants";
import { CREATE_VARIANTS_QUERY } from "./graphql";
import invariant from "tiny-invariant";

export async function createVariants(admin, productId: string, flowerValues: string[], sizeValues: string[] ) {
    const variants = [];
    for (let f = 0; f < flowerValues.length; f++) {
        for (let s = 0; s < sizeValues.length; s++) {
            variants.push({
                optionValues: [
                    {
                        optionName: FLOWER_OPTION_NAME,
                        name: flowerValues[f]
                    },
                    {
                        optionName: SIZE_OPTION_NAME,
                        name: sizeValues[s]
                    }
                ]
            })
            
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
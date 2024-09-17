import { DEFAULT_FLOWER_PRICE, FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { createVariants } from "../services/createVariants";
import { ProductImage, VariantInput } from "../../types";

export async function createVariantsFromSelectedValues(
  admin,
  productId: string,
  flowerValues: string[],
  sizeValues: string[],
  paletteValues: string[],
  sizeToPrice: { [key: string]: number },
  flowerToPrice: { [key: string]: number },
  optionToName: { [key: string]: string },
  paletteBackendIdToName: TwoWayFallbackMap,
  sizeEnumToName: TwoWayFallbackMap,
  productImages: ProductImage[] | undefined
) {
  const variants: VariantInput[] = [];
  for (let f = 0; f < flowerValues.length; f++) {
    for (let s = 0; s < sizeValues.length; s++) {
      for (let p = 0; p < paletteValues.length; p++) {
        const sizePrice: number = Object.prototype.hasOwnProperty.call(sizeToPrice, sizeValues[s])
          ? sizeToPrice[sizeValues[s]]
          : SIZE_TO_PRICE_DEFAULT_VALUES[sizeValues[s]]
        const flowerPrice: number = Object.prototype.hasOwnProperty.call(flowerToPrice, flowerValues[f])
          ? flowerToPrice[flowerValues[s]]
          : DEFAULT_FLOWER_PRICE
        const variant: VariantInput = {
          optionValues: [
            {
              optionName: optionToName[FLOWER_OPTION_NAME],
              name: flowerValues[f]
            },
            {
              optionName: optionToName[SIZE_OPTION_NAME],
              name: sizeEnumToName.getValue(sizeValues[s])
            },
            {
              optionName: optionToName[PALETTE_OPTION_NAME],
              name: paletteBackendIdToName.getValue(paletteValues[p])
            }
          ],
          price: (sizePrice + flowerPrice).toString(),
          inventoryPolicy: "CONTINUE"
        };
        // update media 
        const paletteId: string = paletteValues[p];
        const mediaId: string = productImages?.find((media) => media.alt == paletteId)?.id;
        if (mediaId) {
          variant['mediaId'] = mediaId;
        }

        variants.push(variant);
      }

    }
  }

  const updatedProduct = await createVariants(admin, productId, variants);
  return updatedProduct;
}
import { PALETTE_OPTION_NAME } from "~/constants";
import { ProductImage, ProductMetadata } from "~/types";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { bulkUpdateVariants } from "../services/bulkUpdateVariants";

export async function updateVariantMedia(
  admin,
  product,
  variantNodes,
  productMetadata: ProductMetadata,
  paletteIdToName: TwoWayFallbackMap,
  optionToNameUpdates: { [key: string]: string },
  productImages: ProductImage[] | undefined
) {
  const productId: string = product.id;
  const newVariants = [];

  const paletteOptionName = optionToNameUpdates[PALETTE_OPTION_NAME] != null ? optionToNameUpdates[PALETTE_OPTION_NAME] : productMetadata.optionToName[PALETTE_OPTION_NAME];

  variantNodes.forEach((variantNode) => {
    const variant = {};

    // update media 
    const paletteId: string = paletteIdToName.getReverseValue(variantNode.selectedOptions.find((option) => option.name === paletteOptionName).value);
    const mediaId: string = productImages?.find((media) => media.alt == paletteId)?.id;
    if (mediaId) {
      variant['mediaId'] = mediaId;
    }

    if (Object.entries(variant).length > 0) {
      variant['id'] = variantNode.id;
      newVariants.push(variant);
    }
  });

  if (newVariants.length > 0) {
    await bulkUpdateVariants(admin, productId, newVariants);
  }
}

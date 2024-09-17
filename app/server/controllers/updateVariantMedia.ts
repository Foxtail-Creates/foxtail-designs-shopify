import { PALETTE_OPTION_NAME } from "~/constants";
import { ProductImage, ProductMetadata } from "~/types";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { bulkUpdateVariants } from "../services/bulkUpdateVariants";

export async function updateVariantMedia(
  admin,
  product,
  variantNodes,
  paletteIdToName: TwoWayFallbackMap,
  productImages: ProductImage[] | undefined
) {
  const productId: string = product.id;
  const newVariants = [];

  variantNodes.forEach((variantNode) => {
    const variant = {};

    // update media 
    const paletteId: string = paletteIdToName.getReverseValue(variantNode.selectedOptions.find((option) => option.name === PALETTE_OPTION_NAME).value);
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

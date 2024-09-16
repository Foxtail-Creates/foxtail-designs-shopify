import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { deleteProductMedia } from "../services/deleteProductMedia";
import { CreateMediaInput } from "~/types/admin.types";
import { PRODUCT_MAIN_IMAGE_SOURCE } from "~/constants";
import { createProductMedia } from "../services/createProductMedia";
import { ProductImage } from "~/types";
import { Palette } from "@prisma/client";

/**
 * Creates product media
 */
export async function updateProductMedia(
  admin: AdminApiContext,
  paletteOptionValuesToRemove: string[],
  paletteOptionValuesToAdd: string[],
  productImages: ProductImage[] | undefined,
  productId: string,
  allPaletteColorOptions: Palette[],
  palettesSelected: string[]
) {

  const shouldUpdatePaletteImages = paletteOptionValuesToRemove.length > 0 || paletteOptionValuesToAdd.length > 0 || productImages?.length == 0;

  // delete all existing images
  if (productImages?.length && shouldUpdatePaletteImages) {
    const mediaIds = productImages.map((media) => media.id);
    await deleteProductMedia(admin, mediaIds, productId);
  }

  // add new images for palette bouquets
  if (palettesSelected.length > 0 && shouldUpdatePaletteImages) {
    let createMediaInput: CreateMediaInput[] = allPaletteColorOptions.filter(
      (palette) => palettesSelected.includes(palette.id.toString()),
    ).map((palette) => {
      return {
        alt: `${palette.id}`,
        originalSource: palette.imageLink,
        mediaContentType: "IMAGE"
      };
    });

    // add main image for product as first image in list
    createMediaInput = [{
      alt: `Custom Order`,
      originalSource: PRODUCT_MAIN_IMAGE_SOURCE,
      mediaContentType: "IMAGE"
    }].concat(createMediaInput)

    const media = await createProductMedia(admin, createMediaInput, productId);
    return media;
  }
}
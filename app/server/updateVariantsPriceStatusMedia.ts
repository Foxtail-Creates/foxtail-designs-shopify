import { DEFAULT_FLOWER_PRICE, FLOWER_OPTION_NAME, PALETTE_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { BULK_UPDATE_VARIANTS_QUERY } from "./graphql/queries/productVariant/bulkUpdateVariants";
import { ProductMetadata } from "~/types";
import { TwoWayFallbackMap } from "./models/TwoWayFallbackMap";

export async function updateVariantsPriceStatusMedia(
  admin,
  product,
  variantNodes,
  productMetadata: ProductMetadata,
  sizeToPriceUpdates: { [key: string]: number },
  sizeEnumToName: TwoWayFallbackMap,
  flowerToPriceUpdates: { [key: string]: number },
  paletteIdToName: TwoWayFallbackMap,
  optionToNameUpdates: { [key: string]: string },
) {
  const productId: string = product.id;
  // product images
  const productImages = product.media?.nodes
      ?.filter((media) => media.mediaContentType === "IMAGE")
      ?.map((media) => {
          return { id: media.id, alt: media.alt }
      });

  const newVariants = [];

  const sizeOptionName = optionToNameUpdates[SIZE_OPTION_NAME] != null ? optionToNameUpdates[SIZE_OPTION_NAME] : productMetadata.optionToName[SIZE_OPTION_NAME];
  const flowerOptionName = optionToNameUpdates[FLOWER_OPTION_NAME] != null ? optionToNameUpdates[FLOWER_OPTION_NAME] : productMetadata.optionToName[FLOWER_OPTION_NAME];
  const paletteOptionName = optionToNameUpdates[PALETTE_OPTION_NAME] != null ? optionToNameUpdates[PALETTE_OPTION_NAME] : productMetadata.optionToName[PALETTE_OPTION_NAME];

  variantNodes.forEach((variantNode) => {
    const variant = {};
    // set inventory policy if variant needs it
    if (variantNode.inventoryPolicy !== "CONTINUE") {
      variant['inventoryPolicy'] = "CONTINUE";
    }

    // if flower or size options are in the update maps, recalculate price
    const sizeEnum: string = sizeEnumToName.getReverseValue(variantNode.selectedOptions.find((option) => option.name == sizeOptionName).value);
    const shouldUpdateSizePrice: boolean = Object.prototype.hasOwnProperty.call(sizeToPriceUpdates, sizeEnum);
    const defaultSizePrice: number = Object.prototype.hasOwnProperty.call(productMetadata.sizeToPrice, sizeEnum)
      ? productMetadata.sizeToPrice[sizeEnum]
      : SIZE_TO_PRICE_DEFAULT_VALUES[sizeEnum];

    const flowerName: string = variantNode.selectedOptions.find((option) => option.name === flowerOptionName).value;
    const shouldUpdateFlowerPrice: boolean = Object.prototype.hasOwnProperty.call(flowerToPriceUpdates, flowerName);
    const defaultFlowerPrice: number = Object.prototype.hasOwnProperty.call(productMetadata.flowerToPrice, flowerName)
      ? productMetadata.flowerToPrice[flowerName]
      : DEFAULT_FLOWER_PRICE;

    if (shouldUpdateSizePrice || shouldUpdateFlowerPrice) {
      const sizePrice = shouldUpdateSizePrice ? sizeToPriceUpdates[sizeEnum] : defaultSizePrice;
      const flowerPrice = shouldUpdateFlowerPrice ? flowerToPriceUpdates[flowerName] : defaultFlowerPrice;
      variant['price'] = (sizePrice + flowerPrice).toString();
    }

    // update media 
    const paletteId: string = paletteIdToName.getReverseValue(variantNode.selectedOptions.find((option) => option.name === paletteOptionName).value);
    const mediaId: string = productImages.find((media) => media.alt == paletteId)?.id;
    const doesExistingMediaMatch = variantNode.media.nodes?.find((media) => media.id == mediaId);
    if (mediaId && !doesExistingMediaMatch) {
        variant['mediaId'] = mediaId;
    }

    if (Object.entries(variant).length > 0) {
      variant['id'] = variantNode.id;
      newVariants.push(variant);
    }
  });

  if (newVariants.length > 0) {

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
}

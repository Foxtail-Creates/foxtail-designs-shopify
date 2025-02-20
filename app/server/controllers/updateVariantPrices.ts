import { DEFAULT_FLOWER_PRICE, FLOWER_OPTION_NAME, SIZE_OPTION_NAME, SIZE_TO_PRICE_DEFAULT_VALUES } from "~/constants";
import { ProductMetadata } from "~/types";
import { TwoWayFallbackMap } from "~/server/utils/TwoWayFallbackMap";
import { bulkUpdateVariants } from "../services/bulkUpdateVariants";

export async function updateVariantPrices(
  admin,
  product,
  variantNodes,
  productMetadata: ProductMetadata,
  sizeToPriceUpdates: { [key: string]: number },
  sizeEnumToName: TwoWayFallbackMap,
  flowerToPriceUpdates: { [key: string]: number },
  paletteIdToName: TwoWayFallbackMap
) {
  const productId: string = product.id;
  const newVariants = [];

  variantNodes.forEach((variantNode) => {
    const variant = {};

    // if flower or size options are in the update maps, recalculate price
    const sizeEnum: string = sizeEnumToName.getReverseValue(variantNode.selectedOptions.find((option) => option.name == SIZE_OPTION_NAME).value);
    const shouldUpdateSizePrice: boolean = Object.prototype.hasOwnProperty.call(sizeToPriceUpdates, sizeEnum);
    const defaultSizePrice: number = Object.prototype.hasOwnProperty.call(productMetadata.sizeToPrice, sizeEnum)
      ? productMetadata.sizeToPrice[sizeEnum]
      : SIZE_TO_PRICE_DEFAULT_VALUES[sizeEnum];

    const flowerName: string = variantNode.selectedOptions.find((option) => option.name === FLOWER_OPTION_NAME).value;
    const shouldUpdateFlowerPrice: boolean = Object.prototype.hasOwnProperty.call(flowerToPriceUpdates, flowerName);
    const defaultFlowerPrice: number = Object.prototype.hasOwnProperty.call(productMetadata.flowerToPrice, flowerName)
      ? productMetadata.flowerToPrice[flowerName]
      : DEFAULT_FLOWER_PRICE;

    if (shouldUpdateSizePrice || shouldUpdateFlowerPrice) {
      const sizePrice = shouldUpdateSizePrice ? sizeToPriceUpdates[sizeEnum] : defaultSizePrice;
      const flowerPrice = shouldUpdateFlowerPrice ? flowerToPriceUpdates[flowerName] : defaultFlowerPrice;
      variant['price'] = (sizePrice + flowerPrice).toString();
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

import { FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_DEFAULT_VALUES, PRODUCT_METADATA_PRICES } from "~/constants";
import { ProductMetadata } from "~/types";
import { GET_PRODUCT_BY_ID_QUERY } from "../graphql";
import { bulkUpdateVariants } from "../services/bulkUpdateVariants";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export async function updateMediaForVariants(
  admin: AdminApiContext,
  productId: string,
) {
  // get new product variants
  const customProductResponse = await admin.graphql(
    GET_PRODUCT_BY_ID_QUERY,
    {
      variables: {
        id: productId,
        namespace: FOXTAIL_NAMESPACE,
        key: PRODUCT_METADATA_PRICES
      },
    },
  );
  const customProduct = (await customProductResponse.json()).data.product;

  const productMetadata: ProductMetadata = PRODUCT_METADATA_DEFAULT_VALUES;
  const savedMetadata = JSON.parse(customProduct.metafield?.value);
  for (const key in savedMetadata) {
    productMetadata[key] = savedMetadata[key];
  }

  // product images
  const productImages = customProduct.media?.nodes
    ?.filter((media) => media.mediaContentType === "IMAGE")
    ?.map((media) => {
      return { id: media.id, alt: media.alt }
    });

  // variants
  const newVariants = [];

  customProduct.variants.nodes.forEach((variantNode) => {
    const palette: string = variantNode.selectedOptions.find((option) => option.name == productMetadata.optionToName[PALETTE_OPTION_NAME]).value;
    const mediaId: string = productImages.find((media) => media.alt == palette)?.id;
    const doesExistingMediaMatch = variantNode.media.nodes?.find((media) => media.id == mediaId);
    if (mediaId && !doesExistingMediaMatch) {
      newVariants.push({
        id: variantNode.id,
        mediaId: mediaId
      })
    }
  });

  if (newVariants.length > 0) {
    await bulkUpdateVariants(admin, productId, newVariants);
  }
}

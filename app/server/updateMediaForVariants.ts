import { FOXTAIL_NAMESPACE, PALETTE_OPTION_NAME, PRODUCT_METADATA_DEFAULT_VALUES, PRODUCT_METADATA_PRICES } from "~/constants";
import { BULK_UPDATE_VARIANTS_QUERY } from "./graphql/queries/productVariant/bulkUpdateVariants";
import { ProductMetadata } from "~/types";
import { GET_PRODUCT_BY_ID_QUERY } from "./graphql";

export async function updateMediaVariants(
    admin,
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
        const mediaId: string = productImages.find((media) => media.alt == palette).id;
        if (mediaId) {
            newVariants.push({
                id: variantNode.id,
                mediaId: mediaId
            })
        }
    });

    if (newVariants.length == 0) {
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

import { BULK_UPDATE_VARIANTS_QUERY } from "../graphql";


export async function bulkUpdateVariants(
  admin,
  productId: string,
  newVariants
) {
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
};

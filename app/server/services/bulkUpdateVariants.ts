import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { BULK_UPDATE_VARIANTS_QUERY } from "../graphql";
import { FetchResponseBody } from "@shopify/admin-api-client";
import { BulkUpdateVariantsMutation } from "~/types/admin.generated";
import { sendQuery } from "../graphql/client/sendQuery";


export async function bulkUpdateVariants(
  admin: AdminApiContext,
  productId: string,
  newVariants
) {
  const updateVariantsBody: FetchResponseBody<BulkUpdateVariantsMutation> = await sendQuery(
    admin,
    BULK_UPDATE_VARIANTS_QUERY,
    {
      variables: {
        productId: productId,
        variantsToBulkUpdate: newVariants
      }
    }
  );
  const hasErrors: boolean = updateVariantsBody.data?.productVariantsBulkUpdate?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error ("Error updating variants.\n User errors: {"
      + updateVariantsBody.data?.productVariantsBulkUpdate?.userErrors
      + "}");
  }
};

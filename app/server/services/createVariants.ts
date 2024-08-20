import { VariantInput } from "~/types";
import { CREATE_VARIANTS_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { CreateVariantsMutation, ProductFieldsFragment } from "~/types/admin.generated";
import { FetchResponseBody } from "@shopify/admin-api-client";

export async function createVariants(
  admin: AdminApiContext,
  productId: string,
  variants: VariantInput[]
): Promise<ProductFieldsFragment | null | undefined> {
  const createVariantsBody: FetchResponseBody<CreateVariantsMutation> = await sendQuery(
    admin,
    CREATE_VARIANTS_QUERY,
    {
      variables: {
        productId: productId,
        variants: variants

      }
    }
  );

  const hasErrors: boolean = createVariantsBody.data?.productVariantsBulkCreate?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error creating new variant.\n User errors: { "
      + createVariantsBody.data?.productVariantsBulkCreate?.userErrors
      + " }");
  }

  return createVariantsBody.data?.productVariantsBulkCreate?.product;
}
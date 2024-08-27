import { UPDATE_PRODUCT_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";

/**
 * Updates a product
 */
export async function updateProduct(
  admin: AdminApiContext,
  productId: string,
  productName: string,
  productDescription: string,
) {

  const updateProductBody = await sendQuery(
    admin,
    UPDATE_PRODUCT_QUERY,
    {
      variables: {
        productId: productId,
        productName: productName,
        productDescription: productDescription,
      },
    }
  );

  const hasErrors: boolean = updateProductBody.data?.productUpdate?.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error updating product.\n User errors: { "
      + updateProductBody.data?.productUpdate?.userErrors
      + "}");
  }
}
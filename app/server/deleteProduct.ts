import { DELETE_PRODUCT_QUERY } from "./graphql";

export async function deleteProduct(admin, productId) {
    const deleteProductResponse = await admin.graphql(
        DELETE_PRODUCT_QUERY,
        {
          variables: {
            productId: productId
          },
        },
      );
      const deleteProductBody = await deleteProductResponse.json();
      const hasErrors: boolean = deleteProductBody.data?.productDelete.userErrors.length != 0;
      if (hasErrors) {
          console.log("Error updating variants. Message {"
              + deleteProductBody.data?.productDelete.userErrors[0].message
              + "} on field {"
              + deleteProductBody.data?.productDelete.userErrors[0].field
              + "}");
          throw "Error deleting product. Contact Support for help.";
      }
}
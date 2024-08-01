import { ACTIVATE_PRODUCT_QUERY } from "./graphql";

export async function activateProduct(admin, productId) {
    const activateProductResponse = await admin.graphql(
        ACTIVATE_PRODUCT_QUERY,
        {
          variables: {
            id: productId
          },
        },
      );
      const activateProductBody = await activateProductResponse.json();
      const hasErrors: boolean = activateProductBody.data?.productChangeStatus.userErrors.length != 0;
      if (hasErrors) {
          console.log("Error updating variants. Message {"
              + activateProductBody.data?.productChangeStatus.userErrors[0].message
              + "} on field {"
              + activateProductBody.data?.productChangeStatus.userErrors[0].field
              + "}");
          throw "Error activating product. Contact Support for help.";
      }
}
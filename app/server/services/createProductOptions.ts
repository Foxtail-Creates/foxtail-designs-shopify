import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { CREATE_PRODUCT_OPTIONS_QUERY } from "../graphql";

export async function createProductOptions(
  admin: AdminApiContext,
  productId: string,
  position: number,
  name: string,
  values
) {
  const createProductOptionsResponse = await admin.graphql(
    CREATE_PRODUCT_OPTIONS_QUERY,
    {
      variables: {
        productId: productId,
        position: position,
        name: name,
        values: values.map((value: string) => ({ "name": value }))
      },
    },
  );
  const createProductOptionsBody = await createProductOptionsResponse.json();

  const hasErrors: boolean = createProductOptionsBody.data?.productOptionsCreate.userErrors.length != 0;
  if (hasErrors) {
    throw new Error("Error creating new product options. \n User errors: { "
      + JSON.stringify(createProductOptionsBody.data?.productOptionsCreate.userErrors)
      + "}"
    );
  }
  return createProductOptionsBody.data?.productOptionsCreate.product;
};
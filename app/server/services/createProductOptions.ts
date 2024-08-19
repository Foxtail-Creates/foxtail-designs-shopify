import { CREATE_PRODUCT_OPTIONS_QUERY } from "../graphql";

export async function createProductOptions(
  admin,
  productId,
  position,
  name,
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
    console.log("Error creating new product options. Message {"
      + createProductOptionsBody.data?.productOptionsCreate.userErrors[0].message
      + "} on field {"
      + createProductOptionsBody.data?.productOptionsCreate.userErrors[0].field
      + "}");
    throw "Error creating new product options. Contact Support for help.";
  }

};
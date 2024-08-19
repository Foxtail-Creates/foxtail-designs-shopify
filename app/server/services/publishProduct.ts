import { PUBLISH_PRODUCT_QUERY } from "../graphql";

export async function publishProduct(admin, id, publicationId) {
  const publishProductResponse = await admin.graphql(
    PUBLISH_PRODUCT_QUERY,
    {
      variables: {
        id: id,
        publicationId: publicationId
      },
    },
  );
  const publishProductResponseBody = await publishProductResponse.json();
  const hasErrors: boolean = publishProductResponseBody.data?.publishablePublish.userErrors.length != 0;
  if (hasErrors) {
    console.log("Error publishing product. Message {"
      + publishProductResponseBody.data?.publishablePublish.userErrors[0].message
      + "} on field {"
      + publishProductResponseBody.data?.publishablePublish.userErrors[0].field
      + "}");
    throw "Error publishing product. Contact Support for help.";
  }
}

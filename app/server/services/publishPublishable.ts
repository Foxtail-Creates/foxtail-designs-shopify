import { PUBLISH_PUBLISHABLE_QUERY } from "../graphql";

export async function publishPublishable(admin, id, publicationId) {
  const publishPublishableResponse = await admin.graphql(
    PUBLISH_PUBLISHABLE_QUERY,
    {
      variables: {
        id: id,
        publicationId: publicationId
      },
    },
  );
  const publishPublishableResponseBody = await publishPublishableResponse.json();
  const hasErrors: boolean = publishPublishableResponseBody.data?.publishablePublish.userErrors.length != 0;
  if (hasErrors) {
    console.log("Error publishing publishable. Message {"
      + publishPublishableResponseBody.data?.publishablePublish.userErrors[0].message
      + "} on field {"
      + publishPublishableResponseBody.data?.publishablePublish.userErrors[0].field
      + "}");
    throw "Error publishing publishable. Contact Support for help.";
  }
}

import { DELETE_SHOP_METAFIELD_QUERY } from "../graphql";

export async function deleteShopMetafield(admin, metafieldId) {
  const deleteStoreMetafieldResponse = await admin.graphql(
    DELETE_SHOP_METAFIELD_QUERY,
    {
      variables: {
        metafieldId: metafieldId
      },
    },
  );
  const deleteStoreMetafieldBody = await deleteStoreMetafieldResponse.json();
  const hasErrors: boolean = deleteStoreMetafieldBody.data?.metafieldDelete.userErrors.length != 0;
  if (hasErrors) {
    console.log("Error updating variants. Message {"
      + deleteStoreMetafieldBody.data?.metafieldDelete.userErrors[0].message
      + "} on field {"
      + deleteStoreMetafieldBody.data?.metafieldDelete.userErrors[0].field
      + "}");
    throw "Error deleting shop metafield. Contact Support for help.";
  }
}

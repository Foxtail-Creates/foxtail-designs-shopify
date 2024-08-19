import invariant from "tiny-invariant";
import { SET_PRODUCT_METAFIELD_QUERY } from "../graphql";

export async function setProductMetadata(
  admin,
  productId: string,
  namespace: string,
  key: string,
  value: string
) {
  const setProductMetadataResponse = await admin.graphql(
    SET_PRODUCT_METAFIELD_QUERY,
    {
      variables: {
        productId: productId,
        namespace: namespace,
        key: key,
        value: value
      },
    },
  );
  const setProductMetadataBody = await setProductMetadataResponse.json();
  invariant(setProductMetadataBody.data.metafieldsSet.userErrors.length == 0,
    "Error setting product metadata. Contact Support for help."
  );
};

import { getPublications } from "../services/getPublications";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { unpublishProduct } from "../services/unpublishProduct";

export async function unpublishProductInOnlineStore(admin: AdminApiContext,
  productId: string, publishedAt: string) {
    if (publishedAt == null || publishedAt === "null") {
      const publications = await getPublications(admin);
      const onlineStore = publications?.nodes.find( (node) => node.catalog?.title.endsWith("Online Store"));
      if (onlineStore == null) {
        throw "Unable to unpublish product in Online Store. Could not find Online Store in publications."
        + " Please confirm that Online Store is available sales channel.";
      }

      await unpublishProduct(admin, productId, onlineStore.id);
    }
  }
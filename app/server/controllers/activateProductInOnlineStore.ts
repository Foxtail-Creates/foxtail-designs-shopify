import { activateProduct } from "../services/activateProduct";
import { getPublications } from "../services/getPublications";
import { publishProduct } from "../services/publishProduct";

export async function activateProductInOnlineStore(admin, product) {
    if (product.status !== "ACTIVE") {
      await activateProduct(admin, product.id);
    }

    if (product.publishedAt == null) {
      const publications = await getPublications(admin);
      const onlineStore = publications?.nodes.find( (node) => node.catalog.title.endsWith("Online Store"));
      if (onlineStore == null) {
        throw "Unable to publish product to Online Store. Could not find Online Store in publications."
        + " Please confirm that Online Store is available.";
      }

      await publishProduct(admin, product.id, onlineStore.id);
    }
  }
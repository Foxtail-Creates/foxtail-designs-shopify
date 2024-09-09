import { GET_SHOP_INFORMATION_QUERY } from "../graphql";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";
import { Shop } from "~/types/admin.types";

export async function getShopInformation(admin: AdminApiContext): Promise<Shop> {
    const shopMetadataBody = await sendQuery(
        admin,
        GET_SHOP_INFORMATION_QUERY,
        {},
    );
    return shopMetadataBody.data?.shop;
}

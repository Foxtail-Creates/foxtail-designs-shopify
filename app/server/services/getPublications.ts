import { FetchResponseBody } from "@shopify/admin-api-client";
import { GET_PUBLICATIONS_QUERY } from "../graphql";
import { GetPublicationsQuery } from "~/types/admin.generated";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendQuery } from "../graphql/client/sendQuery";

export async function getPublications(admin: AdminApiContext) {
  const publicationsBody: FetchResponseBody<GetPublicationsQuery> = await sendQuery(
    admin,
    GET_PUBLICATIONS_QUERY,
    {}
  );
  return publicationsBody.data?.publications;
}

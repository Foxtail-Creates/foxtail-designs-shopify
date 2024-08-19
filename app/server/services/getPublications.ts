import { GET_PUBLICATIONS_QUERY } from "../graphql";

export async function getPublications(admin) {
  const publicationsResponse = await admin.graphql(
    GET_PUBLICATIONS_QUERY, {}
  );
  const publicationsBody = await publicationsResponse.json();
  return publicationsBody.data?.publications;
}

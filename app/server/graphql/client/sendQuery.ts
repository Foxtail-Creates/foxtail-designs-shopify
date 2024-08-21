import { GraphqlQueryError } from "@shopify/shopify-api";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export async function sendQuery(admin: AdminApiContext, query, variables) {
  try {
    const queryResponse = await admin.graphql(query, variables);
    return await queryResponse.json();
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
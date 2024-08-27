import { json, type ActionFunctionArgs } from "@remix-run/node";
import crypto from 'crypto';
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Shopify's shared secret key
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export const action = async ({ request }: ActionFunctionArgs) => {
  // clone request because authenticate.webhook(request) consumes the raw payload
  const reqClone = request.clone()
  const rawPayload = await reqClone.text();

  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!(await validateWebhook(request, rawPayload))) {
    throw new Response("Unauthorized", { status: 401 });
  }
  switch (topic) {
    case "APP_UNINSTALLED":
      if (!admin) {
        // The admin context isn't returned if the webhook fired after a shop was uninstalled.
        throw new Response();
      };

      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      // todo: clean up shop metadata field

      break;
    case "CUSTOMERS_DATA_REQUEST":
      // no customer data saved
      return json({ success: true }, 200);
    case "CUSTOMERS_REDACT":
      // no customer data saved
      return json({ success: true }, 200);
    case "SHOP_REDACT":
      // no shop data saved
      return json({ success: true }, 200);
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};

// Function to validate the webhook request came from Shopify.
// See more details at https://shopify.dev/docs/apps/build/webhooks/subscribe/https
async function validateWebhook(request: Request, rawPayload: string) {
  if (!SHOPIFY_API_SECRET) {
    return false;
  }

  const hmacHeader = request.headers.get('x-shopify-hmac-sha256') as string;
  // const body = JSON.stringify(request.body);
  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(rawPayload)
    .digest('base64');

  return (generatedHash === hmacHeader);
}

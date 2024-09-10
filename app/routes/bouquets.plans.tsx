import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    appHandle: process.env.APP_HANDLE || ""
  });
};

export default function SubscriptionPage() {
  const { appHandle } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (!appHandle) return;
    open(`https://admin.shopify.com/charges/${appHandle}/pricing_plans`, "_top");
  }, [appHandle]);

  return (
    <div>Redirecting...</div>
  );
}
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Links, Meta, Outlet, Scripts, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { captureRemixErrorBoundaryError } from "@sentry/remix";
import ErrorPage from "~/components/errors/ErrorPage";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/" rel="home">
          Home
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  captureRemixErrorBoundaryError(error);
  return (
    <html>
      <head>
        <title>Server Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        {ErrorPage()}
        <Scripts />
      </body>
    </html>
  );
}
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

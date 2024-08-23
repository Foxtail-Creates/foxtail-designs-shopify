import * as Sentry from "@sentry/remix";
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";

Sentry.init({
    dsn: "https://698d11a6d9943ef2e1e4a0d333b5b01d@o4507811150692352.ingest.us.sentry.io/4507811153313792",
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches
    }), Sentry.replayIntegration()],
    enabled: process.env.NODE_ENV === "production",
})

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
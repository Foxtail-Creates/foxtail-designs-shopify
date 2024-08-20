import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://698d11a6d9943ef2e1e4a0d333b5b01d@o4507811150692352.ingest.us.sentry.io/4507811153313792",
    tracesSampleRate: 1,
    autoInstrumentRemix: true
})
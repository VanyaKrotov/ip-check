import Fetch from "i18next-fetch-backend";
import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "./utils/query-client";

async function main() {
  await i18next
    .use(initReactI18next)
    .use(Fetch)
    .use(I18nextBrowserLanguageDetector)
    .init({
      fallbackLng: "en",
      detection: {
        order: ["htmlTag", "cookie", "querystring", "navigator"],
        lookupQuerystring: "lng",
        lookupCookie: "lng",
        caches: [],
        convertDetectedLanguage: (lng) => lng.split("-")[0],
      },
      backend: { loadPath: "/_api/locales/{{lng}}/{{ns}}" },
    });

  window.__TANSTACK_QUERY_CLIENT__ = makeQueryClient();

  startTransition(() => {
    hydrateRoot(
      document,
      <QueryClientProvider client={window.__TANSTACK_QUERY_CLIENT__}>
        <I18nextProvider i18n={i18next}>
          <StrictMode>
            <HydratedRouter />
          </StrictMode>
        </I18nextProvider>
      </QueryClientProvider>,
    );
  });
}

main().catch((error) => console.error(error));

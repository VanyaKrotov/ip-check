import { initReactI18next } from "react-i18next";
import { createI18nextMiddleware } from "remix-i18next/middleware";
import "i18next";

import resources from "../locales";
import { localeCookie } from "../locale.cookie";

const SUPPORTED_LANGUAGES = Object.keys(resources);

export const [i18nextMiddleware, getLocale, getInstance] =
  createI18nextMiddleware({
    detection: {
      supportedLanguages: SUPPORTED_LANGUAGES,
      fallbackLanguage: "en",
      order: ["searchParams", "cookie", "header"],
      searchParamKey: "lng",
      sessionKey: "lng",
      cookie: localeCookie,
    },
    i18next: { resources },
    plugins: [initReactI18next],
  });

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: typeof resources.ru;
  }
}

import i18n from "i18next";

export const supportedLanguages = ["en", "fi", "de", "pl", "ru"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  fi: "Suomi",
  de: "Deutsch",
  pl: "Polski",
  ru: "Русский",
};

export const countryLanguageMap: Record<string, SupportedLanguage> = {
  FI: "fi",
  DE: "de",
  AT: "de",
  CH: "de",
  PL: "pl",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
};

export function hasExplicitLanguage() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("ip-check-language-source") === "manual";
}

export default i18n;

import type { Locale } from "date-fns";
import { de, enUS, fi, pl, ru } from "date-fns/locale";

const dateLocales: Record<string, Locale> = {
  de,
  en: enUS,
  fi,
  pl,
  ru,
};

export function getDateLocale(language?: string) {
  return dateLocales[(language || "en").slice(0, 2)] || enUS;
}

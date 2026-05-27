import { useEffect } from "react";
import type { i18n as I18nInstance } from "i18next";

import { countryLanguageMap, hasExplicitLanguage } from "~/lib/i18n";

export function useAutoLanguage(countryCode: string | undefined, i18n: I18nInstance) {
  useEffect(() => {
    if (!countryCode || hasExplicitLanguage()) {
      return;
    }

    const language = countryLanguageMap[countryCode.toUpperCase()];
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [countryCode, i18n]);
}

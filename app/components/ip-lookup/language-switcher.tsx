import type { i18n as I18nInstance } from "i18next";
import { useTranslation } from "react-i18next";

import { Select } from "~/components/ui/select";
import { languageNames, markLanguageManual, supportedLanguages } from "~/lib/i18n";

export function LanguageSwitcher({ i18n }: { i18n: I18nInstance }) {
  const { t } = useTranslation();

  function changeLanguage(value: string) {
    markLanguageManual(value);
    i18n.changeLanguage(value);
  }

  return (
    <label className="flex w-full items-center gap-3 sm:w-auto">
      <span className="text-sm font-medium text-muted-foreground">{t("language")}</span>
      <Select
        className="min-w-36"
        value={(i18n.resolvedLanguage || "en").slice(0, 2)}
        onChange={(event) => changeLanguage(event.target.value)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {languageNames[language]}
          </option>
        ))}
      </Select>
    </label>
  );
}

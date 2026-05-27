import { Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "~/components/ip-lookup/language-switcher";

export function AppHeader() {
  const { t, i18n } = useTranslation();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Globe2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-bold tracking-normal">{t("brand")}</p>
          <p className="text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
      </div>
      <LanguageSwitcher i18n={i18n} />
    </header>
  );
}

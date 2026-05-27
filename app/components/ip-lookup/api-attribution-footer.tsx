import { useTranslation } from "react-i18next";

export function ApiAttributionFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>{t("apiAttribution")}</span>
        <a
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          href="https://ip-api.com"
          rel="noreferrer"
          target="_blank"
        >
          ip-api.com
        </a>
      </div>
    </footer>
  );
}

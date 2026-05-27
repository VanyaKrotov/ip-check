import type { i18n as I18nInstance } from "i18next";
import { useTranslation } from "react-i18next";

import { ApiAttributionFooter } from "~/components/ip-lookup/api-attribution-footer";
import { DetailsSection } from "~/components/ip-lookup/details-section";
import { HeroSection } from "~/components/ip-lookup/hero-section";
import type { LookupResult } from "~/utils/ip-lookup-types";
import { useAutoLanguage } from "~/utils/use-auto-language";
import { useCheckedAt } from "~/utils/use-checked-at";
import { useIpLookup } from "~/utils/use-ip-lookup";
import { usePageMetadata } from "~/utils/use-page-metadata";

export function IpLookupPage({
  defaultIp,
  initial,
}: {
  defaultIp: string;
  initial: LookupResult | null;
}) {
  const { i18n, t } = useTranslation();
  const { input, query, setInput, submitLookup, target } = useIpLookup(defaultIp, initial);
  const ipInfo = query.data;
  const checkedAt = useCheckedAt(ipInfo?.checkedAt, i18n.resolvedLanguage);

  useAutoLanguage(ipInfo?.countryCode, i18n as I18nInstance);
  usePageMetadata({
    description: t("metaDescription"),
    language: (i18n.resolvedLanguage || "en").slice(0, 2),
    title: t("metaTitle"),
  });

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <HeroSection
        i18n={i18n as I18nInstance}
        input={input}
        isFetching={query.isFetching}
        onInputChange={setInput}
        onSubmit={submitLookup}
      />
      <DetailsSection checkedAt={checkedAt} ipInfo={ipInfo} isError={query.isError} target={target} />
      <ApiAttributionFooter />
    </main>
  );
}

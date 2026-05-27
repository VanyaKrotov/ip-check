import type { i18n as I18nInstance } from "i18next";
import { useTranslation } from "react-i18next";

import { ApiAttributionFooter } from "~/components/ip-lookup/api-attribution-footer";
import { DetailsSection } from "~/components/ip-lookup/details-section";
import { HeroSection } from "~/components/ip-lookup/hero-section";
import { useIpLookup } from "~/utils/use-ip-lookup";

export function IpLookupPage({ defaultIp }: { defaultIp: string }) {
  const { i18n } = useTranslation();
  const { input, query, setInput, submitLookup, target } =
    useIpLookup(defaultIp);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <HeroSection
        i18n={i18n as I18nInstance}
        input={input}
        isFetching={query.isFetching}
        onInputChange={setInput}
        onSubmit={submitLookup}
      />
      <DetailsSection
        ipInfo={query.data}
        isError={query.isError}
        target={target}
      />
      <ApiAttributionFooter />
    </main>
  );
}

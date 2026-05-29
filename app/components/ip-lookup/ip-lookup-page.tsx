import { ApiAttributionFooter } from "~/components/ip-lookup/api-attribution-footer";
import { DetailsSection } from "~/components/ip-lookup/details-section";
import { HeroSection } from "~/components/ip-lookup/hero-section";
import { useIpLookup } from "~/utils/use-ip-lookup";

export function IpLookupPage({ defaultIp }: { defaultIp: string }) {
  const { query, target } = useIpLookup(defaultIp);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <HeroSection defaultIp={defaultIp} isFetching={query.isFetching} />
      <DetailsSection
        ipInfo={query.data}
        isError={query.isError}
        isLoading={query.isPending}
        target={target}
      />
      <ApiAttributionFooter />
    </main>
  );
}

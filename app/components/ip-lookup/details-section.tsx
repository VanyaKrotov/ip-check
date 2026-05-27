import { IpMetricsGrid } from "~/components/ip-lookup/ip-metrics-grid";
import { IpSummaryCard } from "~/components/ip-lookup/ip-summary-card";
import type { LookupResult } from "~/utils/ip-lookup-types";

export function DetailsSection({
  checkedAt,
  ipInfo,
  isError,
  target,
}: {
  checkedAt: string;
  ipInfo?: LookupResult;
  isError: boolean;
  target: string;
}) {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-8">
      <IpSummaryCard checkedAt={checkedAt} ipInfo={ipInfo} isError={isError} />
      <IpMetricsGrid checkedAt={checkedAt} ipInfo={ipInfo} target={target} />
    </section>
  );
}

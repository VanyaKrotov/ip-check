import { format } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { IpMetricsGrid } from "~/components/ip-lookup/ip-metrics-grid";
import { IpSummaryCard } from "~/components/ip-lookup/ip-summary-card";
import { getDateLocale } from "~/utils/date-locale";
import type { LookupResult } from "~/utils/ip-lookup-types";

interface Props {
  ipInfo?: LookupResult;
  isError: boolean;
  target: string;
}

export function DetailsSection({ ipInfo, isError, target }: Props) {
  const { i18n } = useTranslation();
  const checkedAt = useMemo(
    () =>
      ipInfo?.checkedAt
        ? format(new Date(ipInfo?.checkedAt), "PPpp", {
            locale: getDateLocale(i18n.language),
          })
        : "",
    [ipInfo?.checkedAt],
  );

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-8">
      <IpSummaryCard checkedAt={checkedAt} ipInfo={ipInfo} isError={isError} />
      <IpMetricsGrid checkedAt={checkedAt} ipInfo={ipInfo} target={target} />
    </section>
  );
}

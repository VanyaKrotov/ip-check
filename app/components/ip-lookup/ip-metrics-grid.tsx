import { Building2, Clock, MapPin, Network } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MetricCard } from "~/components/ip-lookup/metric-card";
import type { LookupResult } from "~/utils/ip-lookup-types";
import { booleanValue, coordinateValue } from "~/utils/ip-format";

export function IpMetricsGrid({
  checkedAt,
  ipInfo,
  target,
}: {
  checkedAt: string;
  ipInfo?: LookupResult;
  target: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MetricCard
        icon={<MapPin className="h-5 w-5" />}
        title={t("location")}
        rows={[
          [t("coordinates"), coordinateValue(ipInfo?.lat, ipInfo?.lon)],
          [t("timezone"), ipInfo?.timezone],
          [t("localTime"), checkedAt],
        ]}
      />
      <MetricCard
        icon={<Network className="h-5 w-5" />}
        title={t("network")}
        rows={[
          [t("isp"), ipInfo?.isp],
          [t("organization"), ipInfo?.org],
          [t("asn"), ipInfo?.as],
        ]}
      />
      <MetricCard
        icon={<Building2 className="h-5 w-5" />}
        title={t("signals")}
        rows={[
          [t("reverseDns"), ipInfo?.reverse],
          [t("proxy"), booleanValue(ipInfo?.proxy, t)],
          [t("hosting"), booleanValue(ipInfo?.hosting, t)],
        ]}
      />
      <MetricCard
        icon={<Clock className="h-5 w-5" />}
        title={t("request")}
        rows={[
          [t("queryIp"), target || t("currentIp")],
          [t("mobile"), booleanValue(ipInfo?.mobile, t)],
          ["API", "ip-api.com"],
        ]}
      />
    </div>
  );
}

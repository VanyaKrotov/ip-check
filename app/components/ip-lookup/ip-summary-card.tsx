import { AlertCircle, LocateFixed } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InfoRow } from "~/components/ip-lookup/info-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { LookupResult } from "~/utils/ip-lookup-types";
import { joinDefined } from "~/utils/ip-format";

export function IpSummaryCard({
  checkedAt,
  ipInfo,
  isError,
}: {
  checkedAt: string;
  ipInfo?: LookupResult;
  isError: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LocateFixed className="h-5 w-5 text-primary" />
          {ipInfo?.query || t("emptyValue")}
        </CardTitle>
        <CardDescription>
          {ipInfo?.source === "manual" ? t("manualAddress") : t("yourAddress")}
          {checkedAt ? ` · ${t("updated", { time: checkedAt })}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-destructive">
              <AlertCircle className="h-4 w-4" />
              {t("errorTitle")}
            </div>
            <p className="mt-2 text-muted-foreground">{t("errorBody")}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <InfoRow label={t("status")} value={ipInfo?.status} />
            <InfoRow label={t("country")} value={joinDefined(ipInfo?.country, ipInfo?.countryCode)} />
            <InfoRow label={t("region")} value={joinDefined(ipInfo?.regionName, ipInfo?.region)} />
            <InfoRow label={t("city")} value={ipInfo?.city} />
            <InfoRow label={t("postal")} value={ipInfo?.zip} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { AlertCircle, LocateFixed } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InfoRow } from "~/components/ip-lookup/info-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { joinDefined } from "~/utils/ip-format";
import type { LookupResult } from "~/utils/ip-lookup-types";

export function IpSummaryCard({
  checkedAt,
  ipInfo,
  isError,
  isLoading,
}: {
  checkedAt: string;
  ipInfo?: LookupResult;
  isError: boolean;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LocateFixed className="h-5 w-5 text-primary" />
          {isLoading ? (
            <span className="inline-block h-7 w-40 animate-pulse rounded bg-muted-foreground/20" />
          ) : (
            ipInfo?.query || t("emptyValue")
          )}
        </CardTitle>
        <CardDescription>
          {isLoading ? (
            <span className="inline-block h-4 w-56 animate-pulse rounded bg-muted-foreground/20" />
          ) : (
            <>
              {ipInfo?.source === "manual" ? t("manualAddress") : t("yourAddress")}
              {checkedAt ? ` - ${t("updated", { time: checkedAt })}` : ""}
            </>
          )}
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
            <InfoRow
              isLoading={isLoading}
              label={t("status")}
              value={ipInfo?.status}
            />
            <InfoRow
              isLoading={isLoading}
              label={t("country")}
              value={joinDefined(ipInfo?.country, ipInfo?.countryCode)}
            />
            <InfoRow
              isLoading={isLoading}
              label={t("region")}
              value={joinDefined(ipInfo?.regionName, ipInfo?.region)}
            />
            <InfoRow
              isLoading={isLoading}
              label={t("city")}
              value={ipInfo?.city}
            />
            <InfoRow
              isLoading={isLoading}
              label={t("postal")}
              value={ipInfo?.zip}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

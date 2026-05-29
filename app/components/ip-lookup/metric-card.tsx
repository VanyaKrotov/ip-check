import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { InfoRow } from "~/components/ip-lookup/info-row";
import type { InfoRowData } from "~/utils/ip-lookup-types";

export function MetricCard({
  icon,
  isLoading,
  rows,
  title,
}: {
  icon: ReactNode;
  isLoading?: boolean;
  rows: InfoRowData[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map(([label, value]) => (
          <InfoRow
            key={label}
            isLoading={isLoading}
            label={label}
            value={value}
          />
        ))}
      </CardContent>
    </Card>
  );
}

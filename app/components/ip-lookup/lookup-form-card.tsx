import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

export function LookupFormCard({
  input,
  isFetching,
  onInputChange,
  onSubmit,
}: {
  input: string;
  isFetching: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-primary/20 bg-card/88 shadow-soft backdrop-blur">
      <CardHeader>
        <CardTitle>{t("queryIp")}</CardTitle>
        <CardDescription>{t("defaultIpHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <Input
            aria-label={t("queryIp")}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={t("ipPlaceholder")}
            title={t("enterToSearch")}
          />
          <Button className="sm:min-w-32" type="submit" disabled={isFetching}>
            {isFetching ? t("checking") : t("lookup")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

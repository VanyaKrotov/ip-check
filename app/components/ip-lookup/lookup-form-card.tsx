import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Props {
  isFetching: boolean;
  defaultIp: string | null;
}

export function LookupFormCard({ isFetching, defaultIp }: Props) {
  const [input, setInput] = useState(defaultIp ?? "");

  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = input.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (normalized) {
      nextParams.set("default_ip", normalized);
    } else {
      nextParams.delete("default_ip");
    }

    setSearchParams(nextParams, { replace: true });
  }

  return (
    <Card className="border-primary/20 bg-card/88 shadow-soft backdrop-blur">
      <CardHeader>
        <CardTitle>{t("queryIp")}</CardTitle>
        <CardDescription>{t("defaultIpHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={submitLookup}
        >
          <Input
            aria-label={t("queryIp")}
            value={input}
            onChange={(event) => setInput(event.target.value)}
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

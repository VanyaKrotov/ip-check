import { ArrowRight, X } from "lucide-react";
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

  function resetLookup() {
    setInput("");
    setSearchParams(
      (prev) => {
        prev.delete("default_ip");

        return new URLSearchParams(prev);
      },
      { replace: true, preventScrollReset: true },
    );
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
          <div className="relative flex-1">
            <Input
              aria-label={t("queryIp")}
              className="pr-11"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("ipPlaceholder")}
              title={t("enterToSearch")}
            />
            {input ? (
              <Button
                aria-label={t("resetLookup")}
                className="absolute right-1 top-1 h-8 w-8"
                onClick={resetLookup}
                size="icon"
                title={t("resetLookup")}
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <Button className="sm:min-w-32" type="submit" disabled={isFetching}>
            {isFetching ? t("checking") : t("lookup")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

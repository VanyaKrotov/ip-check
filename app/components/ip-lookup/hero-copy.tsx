import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";

export function HeroCopy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl">
      <Badge>{t("currentIp")}</Badge>
      <h1 className="mt-5 break-words text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{t("subtitle")}</p>
    </div>
  );
}

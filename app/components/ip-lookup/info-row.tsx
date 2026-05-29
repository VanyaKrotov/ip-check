import { useTranslation } from "react-i18next";

export function InfoRow({
  isLoading,
  label,
  value,
}: {
  isLoading?: boolean;
  label: string;
  value?: string | null;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 rounded-lg bg-muted/65 px-3 py-2">
      <span className="min-w-28 max-w-full flex-1 break-words text-sm text-muted-foreground">{label}</span>
      <span className="min-w-36 max-w-full flex-1 break-words text-left text-sm font-semibold sm:text-right">
        {isLoading ? (
          <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted-foreground/20 align-middle" />
        ) : (
          value || t("emptyValue")
        )}
      </span>
    </div>
  );
}

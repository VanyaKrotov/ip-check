import { format } from "date-fns";
import { useMemo } from "react";

import { getDateLocale } from "~/utils/date-locale";
import { useHasMounted } from "~/utils/use-has-mounted";

export function useCheckedAt(checkedAt?: string, language?: string) {
  const mounted = useHasMounted();

  return useMemo(() => {
    if (!mounted || !checkedAt) {
      return "";
    }

    return format(new Date(checkedAt), "PPpp", {
      locale: getDateLocale(language),
    });
  }, [checkedAt, language, mounted]);
}

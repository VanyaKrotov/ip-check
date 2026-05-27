import { createSingletonMiddleware } from "remix-utils/middleware/singleton";

import { makeQueryClient } from "~/utils/query-client";

export const [queryMiddleware, getQuerySingleton] = createSingletonMiddleware({
  instantiator: () =>
    typeof window === "undefined"
      ? makeQueryClient()
      : window.__TANSTACK_QUERY_CLIENT__,
});

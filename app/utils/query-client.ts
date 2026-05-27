import { QueryClient, type DehydratedState } from "@tanstack/react-query";

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime({ state }) {
          if (!state.dataUpdateCount || state.isInvalidated) {
            return 0;
          }

          // default staleTime for all queries
          return 5 * 60 * 1000;
        },
      },
    },
  });

export const getDehydratedState = (
  data: Record<string, unknown>,
): DehydratedState => {
  const state: DehydratedState = { mutations: [], queries: [] };
  for (const key in data) {
    const value = data[key];
    if (typeof value === "object" && value && "dehydratedState" in value) {
      const dehydratedState = value.dehydratedState as DehydratedState;

      state.mutations.push(...dehydratedState.mutations);
      state.queries.push(...dehydratedState.queries);
    }
  }

  return state;
};

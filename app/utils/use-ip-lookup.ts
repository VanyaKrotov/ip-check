import { useSearchParams } from "react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";

import type { LookupResult } from "./ip-lookup-types";

async function fetchIpInfoFromRoute(
  ip: string | null,
  signal?: AbortSignal,
): Promise<LookupResult> {
  const params = new URLSearchParams();
  if (ip) {
    params.set("ip", ip);
  }

  const response = await fetch(`/api/ip-info?${params}`, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });
  const data = (await response.json()) as LookupResult;

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "IP lookup failed");
  }

  return data;
}

export const getIpLookupQuery = (
  requestedIp: string | null,
  defaultIp: string | null,
) => {
  const ipToLoad = requestedIp || defaultIp;

  return queryOptions({
    queryKey: ["ip-info", ipToLoad || "self"],
    enabled: typeof window !== "undefined",
    refetchOnMount: false,
    retry: false,
    queryFn: async ({ signal }) => {
      return fetchIpInfoFromRoute(ipToLoad, signal);
    },
  });
};

export function useIpLookup(defaultIp: string) {
  const [searchParams] = useSearchParams();

  const requestedIp = searchParams.get("default_ip");
  const target = requestedIp || defaultIp;

  const query = useQuery(getIpLookupQuery(requestedIp, defaultIp));

  return {
    query,
    target,
  };
}

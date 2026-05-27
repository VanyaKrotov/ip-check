import { useSearchParams } from "react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchIpInfo } from "~/lib/ip-api";

import type { LookupResult } from "./ip-lookup-types";

export const getIpLookupQuery = (
  requestedIp: string | null,
  defaultIp: string | null,
) => {
  const ipToLoad = requestedIp || defaultIp;

  return queryOptions({
    queryKey: ["ip-info", ipToLoad || "self"],
    refetchOnMount: false,
    queryFn: async ({ signal }) => {
      const data = await fetchIpInfo(ipToLoad, signal);

      return {
        ...data,
        source: requestedIp ? "manual" : "request",
      } as LookupResult;
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

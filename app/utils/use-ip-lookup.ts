import { type FormEvent, useState } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(defaultIp);

  const requestedIp = searchParams.get("default_ip");
  const target = requestedIp || defaultIp;

  const query = useQuery(getIpLookupQuery(requestedIp, defaultIp));

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

  return {
    input,
    query,
    target,
    setInput,
    submitLookup,
  };
}

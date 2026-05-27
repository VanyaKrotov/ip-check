import axios from "axios";
import { type FormEvent, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import type { LookupResult } from "~/utils/ip-lookup-types";

export function useIpLookup(defaultIp: string, initial: LookupResult | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(defaultIp);
  const [target, setTarget] = useState(defaultIp);

  const query = useQuery({
    queryKey: ["ip-info", target || "self"],
    queryFn: async () => {
      const response = await axios.get<LookupResult>("/api/ip", {
        params: target ? { ip: target } : undefined,
      });
      return response.data;
    },
    initialData: initial && (target || "") === (defaultIp || "") ? initial : undefined,
  });

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = input.trim();
    setTarget(normalized);

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
    setInput,
    submitLookup,
    target,
  };
}

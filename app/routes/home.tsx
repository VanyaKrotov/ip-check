import { QueryClientProvider } from "@tanstack/react-query";
import { data, type LoaderFunctionArgs, useLoaderData } from "react-router";

import { IpLookupPage } from "~/components/ip-lookup/ip-lookup-page";
import { fetchIpInfo, readForwardedIp } from "~/lib/ip-api";
import type { LookupResult } from "~/utils/ip-lookup-types";
import { queryClient } from "~/utils/query-client";

export const meta = () => [
  { title: "IP Check - IP lookup and geolocation" },
  {
    name: "description",
    content: "Check location, ISP, ASN, timezone and network information for any IP address.",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const defaultIp = url.searchParams.get("default_ip")?.trim() || "";
  const inferredIp = readForwardedIp(request);

  try {
    const initial = await fetchIpInfo(defaultIp || inferredIp);
    return data({
      defaultIp,
      initial: {
        ...initial,
        source: defaultIp ? "manual" : "request",
        checkedAt: new Date().toISOString(),
      } satisfies LookupResult,
    });
  } catch {
    return data({
      defaultIp,
      initial: null,
    });
  }
}

export default function Home() {
  const { defaultIp, initial } = useLoaderData<typeof loader>();

  return (
    <QueryClientProvider client={queryClient}>
      <IpLookupPage defaultIp={defaultIp} initial={initial} />
    </QueryClientProvider>
  );
}

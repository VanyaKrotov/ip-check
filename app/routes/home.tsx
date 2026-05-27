import { data, type LoaderFunctionArgs, useLoaderData } from "react-router";

import { IpLookupPage } from "~/components/ip-lookup/ip-lookup-page";
import { fetchIpInfo, readForwardedIp } from "~/lib/ip-api";
import type { LookupResult } from "~/utils/ip-lookup-types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const defaultIp = url.searchParams.get("default_ip")?.trim() || "";
  const inferredIp = readForwardedIp(request);

  try {
    const initial = await fetchIpInfo(defaultIp || inferredIp);

    return {
      defaultIp,
      initial: {
        ...initial,
        source: defaultIp ? "manual" : "request",
        checkedAt: new Date().toISOString(),
      } satisfies LookupResult,
    };
  } catch {
    return data({
      defaultIp,
      initial: null,
    });
  }
}

export default function Home() {
  const { defaultIp, initial } = useLoaderData<typeof loader>();

  return <IpLookupPage defaultIp={defaultIp} initial={initial} />;
}

import { data } from "react-router";

import { fetchIpInfo, readForwardedIp } from "~/lib/ip-api";

import type { Route } from "./+types/api.ip-info";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const requestedIp =
    url.searchParams.get("ip") || url.searchParams.get("default_ip");
  const inferredIp = readForwardedIp(request);

  try {
    const result = await fetchIpInfo(requestedIp || inferredIp);

    return data(
      {
        ...result,
        source: requestedIp ? "manual" : "request",
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return data(
      {
        status: "fail",
        message: error instanceof Error ? error.message : "IP lookup failed",
        source: requestedIp ? "manual" : "request",
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 502,
      },
    );
  }
}

import { data, type LoaderFunctionArgs } from "react-router";

import { fetchIpInfo, readForwardedIp } from "~/lib/ip-api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const requestedIp = url.searchParams.get("ip") || url.searchParams.get("default_ip");
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
      { status: 502 },
    );
  }
}

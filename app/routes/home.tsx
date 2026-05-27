import { dehydrate } from "@tanstack/react-query";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";

import { IpLookupPage } from "~/components/ip-lookup/ip-lookup-page";
import { readForwardedIp } from "~/lib/ip-api";
import { getQuerySingleton } from "~/middleware/query";
import { getIpLookupQuery } from "~/utils/use-ip-lookup";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const defaultIp = url.searchParams.get("default_ip")?.trim() || "";
  const inferredIp = readForwardedIp(request);

  const query = getQuerySingleton(context);

  await query.prefetchQuery(getIpLookupQuery(defaultIp, inferredIp));

  return {
    defaultIp,
    dehydratedState: dehydrate(query),
  };
}

export default function Home() {
  const { defaultIp } = useLoaderData<typeof loader>();

  return <IpLookupPage defaultIp={defaultIp} />;
}

import { QueryClientProvider } from "@tanstack/react-query";
import { data, type LoaderFunctionArgs, useLoaderData } from "react-router";

import { IpLookupPage } from "~/components/ip-lookup/ip-lookup-page";
import { fetchIpInfo, readForwardedIp } from "~/lib/ip-api";
import type { LookupResult } from "~/utils/ip-lookup-types";
import { defaultMetaDescription, defaultMetaTitle, ogImagePath } from "~/utils/meta";
import { queryClient } from "~/utils/query-client";

export const meta = () => [
  { title: defaultMetaTitle },
  {
    name: "description",
    content: defaultMetaDescription,
  },
  { property: "og:type", content: "website" },
  { property: "og:title", content: defaultMetaTitle },
  { property: "og:description", content: defaultMetaDescription },
  { property: "og:image", content: ogImagePath },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:type", content: "image/png" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: defaultMetaTitle },
  { name: "twitter:description", content: defaultMetaDescription },
  { name: "twitter:image", content: ogImagePath },
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

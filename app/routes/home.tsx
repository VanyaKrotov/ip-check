import { type LoaderFunctionArgs, useLoaderData } from "react-router";

import { IpLookupPage } from "~/components/ip-lookup/ip-lookup-page";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const defaultIp = url.searchParams.get("default_ip")?.trim() || "";

  return {
    defaultIp,
  };
}

export default function Home() {
  const { defaultIp } = useLoaderData<typeof loader>();

  return <IpLookupPage defaultIp={defaultIp} />;
}

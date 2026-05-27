import axios from "axios";

export type IpApiResponse = {
  status: "success" | "fail";
  message?: string;
  query?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  reverse?: string;
  proxy?: boolean;
  hosting?: boolean;
  mobile?: boolean;
};

const fields = [
  "status",
  "message",
  "query",
  "country",
  "countryCode",
  "region",
  "regionName",
  "city",
  "zip",
  "lat",
  "lon",
  "timezone",
  "isp",
  "org",
  "as",
  "reverse",
  "proxy",
  "hosting",
  "mobile",
].join(",");

export async function fetchIpInfo(ip?: string | null) {
  const target = ip?.trim();
  const url = target
    ? `http://ip-api.com/json/${encodeURIComponent(target)}`
    : "http://ip-api.com/json/";

  const { data } = await axios.get<IpApiResponse>(url, {
    params: { fields },
    timeout: 8000,
  });

  if (data.status !== "success") {
    throw new Error(data.message || "IP lookup failed");
  }

  return data;
}

export function readForwardedIp(request: Request) {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  const value = cfIp || forwarded || realIp;

  if (!value || value === "::1" || value === "127.0.0.1") {
    return null;
  }

  return value;
}

import type { IpApiResponse } from "~/lib/ip-api";

export type LookupResult = IpApiResponse & {
  source: "manual" | "request";
  checkedAt: string;
};

export type InfoRowData = [string, string | undefined | null];

import crypto from "node:crypto";

import { renderToReadableStream } from "react-dom/server";
import {
  RouterContextProvider,
  ServerRouter,
  type EntryContext,
} from "react-router";
import { I18nextProvider } from "react-i18next";
import { QueryClientProvider } from "@tanstack/react-query";

import { getInstance } from "./middleware/i18next";
import { makeQueryClient } from "./utils/query-client";

export const streamTimeout = 1000 * 60;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  routerContext: RouterContextProvider,
) {
  const nonce = crypto.randomBytes(16).toString("base64");
  const i18next = getInstance(routerContext);
  const query = makeQueryClient();

  const body = await renderToReadableStream(
    <I18nextProvider i18n={i18next}>
      <QueryClientProvider client={query}>
        <ServerRouter context={entryContext} url={request.url} nonce={nonce} />
      </QueryClientProvider>
    </I18nextProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // Log streaming rendering errors from inside the shell
        // @ts-ignore
        responseStatusCode = error.status || 500;
      },
    },
  );

  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("X-Frame-Options", "SAMEORIGIN");
  responseHeaders.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

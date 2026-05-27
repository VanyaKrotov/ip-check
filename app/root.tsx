import { useContext, useEffect } from "react";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  UNSAFE_DataRouterStateContext,
  useLoaderData,
} from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/root";
import { HydrationBoundary } from "@tanstack/react-query";

import "./lib/i18n";
import { ogImagePath } from "./utils/meta";
import {
  getInstance,
  getLocale,
  i18nextMiddleware,
} from "./middleware/i18next";
import { localeCookie } from "./locale.cookie";
import { getDehydratedState } from "./utils/query-client";

import "./styles.css";
import { queryMiddleware } from "./middleware/query";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useLoaderData<typeof loader>();
  const { loaderData } = useContext(UNSAFE_DataRouterStateContext)!;

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <HydrationBoundary state={getDehydratedState(loaderData)}>
          {children}
        </HydrationBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData?.metadata.title },
    {
      name: "description",
      content: loaderData?.metadata.description,
    },
    { property: "og:type", content: "website" },
    { property: "og:title", content: loaderData?.metadata.title },
    { property: "og:description", content: loaderData?.metadata.description },
    { property: "og:image", content: ogImagePath },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: loaderData?.metadata.title },
    { name: "twitter:description", content: loaderData?.metadata.description },
    { name: "twitter:image", content: ogImagePath },
  ];
}

export default function App({ loaderData: { locale } }: Route.ComponentProps) {
  let { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return <Outlet />;
}

export async function loader({ context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  const i18next = getInstance(context);

  return data(
    {
      locale,
      metadata: {
        title: i18next.t("metaTitle"),
        description: i18next.t("metaDescription"),
      },
    },
    {
      headers: {
        "Set-Cookie": await localeCookie.serialize(locale, {
          path: "/",
          maxAge: 1000 * 3600,
        }),
      },
    },
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-lg rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-primary">IP Check</p>
        <h1 className="mt-3 text-2xl font-bold">Application error</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}

export const middleware = [i18nextMiddleware, queryMiddleware];
export const clientMiddleware = [i18nextMiddleware, queryMiddleware];

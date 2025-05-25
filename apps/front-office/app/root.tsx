import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import montserrat from "./montserrat.css?url";

import type { Route } from "./+types/root";
import styles from "./app.css?url";

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    href: "/fonts/Montserrat.ttf",
    as: "font",
    type: "font/ttf",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: montserrat,
  },
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // Create a QueryClient instance that persists for the lifetime of the app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
          },
          mutations: {
            onError: (error) => {
              console.error("Mutation error:", error);
            },
          },
        },
      })
  );

  return (
    <html className="dark" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Prevent FOUC by ensuring font is available immediately */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical font loading optimization */
              body { font-family: var(--font-montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif); }
            `,
          }}
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

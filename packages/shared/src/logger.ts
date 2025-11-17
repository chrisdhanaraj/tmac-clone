import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

// Browser transport for client-side logging
const browserTransport = {
  targets: [
    {
      target: "pino/file",
      options: { destination: 1 }, // stdout
    },
  ],
};

// Server-side pretty printing for development
const serverTransport = isDevelopment
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    }
  : undefined;

// Determine if we are in a browser environment
const isBrowser = typeof (globalThis as any).window !== "undefined";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isBrowser ? undefined : serverTransport,
  browser: {
    asObject: true, // Log as objects in browser console for better readability
  },
});

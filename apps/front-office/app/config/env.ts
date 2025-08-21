/**
 * Environment configuration
 * Centralizes all environment variables and provides type-safe access
 */

export const config = {
  auth: {
    baseURL:
      process.env.AUTH_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://your-production-url.com"
        : "http://localhost:5173"),
  },
  app: {
    env: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV !== "production",
    isProduction: process.env.NODE_ENV === "production",
  },
  // Add more configuration as needed
} as const;

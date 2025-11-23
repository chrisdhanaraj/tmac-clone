import { Client } from "discord.js";
import { handleVerificationComplete } from "./flows/member-verification.js";
import { env } from "./env.js";
import { logger } from "@tmac/shared/logger";

export function startWebhookServer(client: Client) {
  const server = Bun.serve({
    port: env.port,

    async fetch(req) {
      const url = new URL(req.url);

      // Health check endpoint
      if (url.pathname === "/health") {
        return new Response("OK", { status: 200 });
      }

      // Verification webhook endpoint
      if (url.pathname === "/webhook/verify-member" && req.method === "POST") {
        try {
          // Verify webhook secret
          const authHeader = req.headers.get("authorization");
          if (authHeader !== `Bearer ${env.webhookSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }

          const body = (await req.json()) as {
            discordId: string;
            email: string;
          };

          if (!body.discordId) {
            return new Response("Missing discordId", { status: 400 });
          }

          // Handle verification completion
          await handleVerificationComplete(body.discordId, client);

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          logger.error(error, "Error processing webhook");
          return new Response("Internal Server Error", { status: 500 });
        }
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  logger.info(
    `🔗 Webhook server listening on port ${server.port} at http://localhost:${server.port}`,
  );

  return server;
}

import { Client, Events, GatewayIntentBits } from "discord.js";

import { env } from "./env.js";
import {
  handleMemberJoin,
  handleDirectMessage,
} from "./flows/member-verification.js";
import { startWebhookServer } from "./webhook-server.js";
import { logger } from "@tmac/shared/logger";
import { handleInteraction } from "./interactions/router.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`✅ Logged in as ${readyClient.user.tag}`);
  // Start webhook server for verification callbacks
  startWebhookServer(client);
});

// Handle new member joins
client.on(Events.GuildMemberAdd, async (member) => {
  await handleMemberJoin(member);
});

// Handle direct messages for email collection
client.on(Events.MessageCreate, async (message) => {
  await handleDirectMessage(message, client);
});

// Handle all interactions via router
client.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

client.login(env.token);

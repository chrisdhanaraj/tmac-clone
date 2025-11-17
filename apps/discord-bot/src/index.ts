import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
} from "discord.js";

import { env } from "./env.js";
import { data as pingData, execute as pingExecute } from "./commands/ping.js";
import { data as matchData, execute as matchExecute } from "./commands/match.js";
import {
  data as welcomeData,
  execute as welcomeExecute,
} from "./commands/welcome.js";
import { data as verifyData, execute as verifyExecute } from "./commands/verify.js";
import {
  handleMemberJoin,
  handleDirectMessage,
} from "./flows/member-verification.js";
import { startWebhookServer } from "./webhook-server.js";
import { logger } from "@tmac/shared/logger";

type ChatInputCommandHandler = (
  interaction: ChatInputCommandInteraction
) => Promise<void>;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

const commands = new Map<string, ChatInputCommandHandler>([
  [pingData.name, pingExecute],
  [matchData.name, matchExecute],
  [welcomeData.name, welcomeExecute],
  [verifyData.name, verifyExecute],
]);

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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const handler = commands.get(interaction.commandName);
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (error) {
    logger.error(error, `Failed to execute /${interaction.commandName}`);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: "Something went wrong executing that command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Something went wrong executing that command.",
        ephemeral: true,
      });
    }
  }
});

client.login(env.token);

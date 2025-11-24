import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { env } from "./env.js";
import { data as matchCommand } from "./commands/match.js";
import { logger } from "@tmac/shared/logger";

const commands = [matchCommand.toJSON()];

// this is the HTTP client abstraction for the Discord API
const rest = new REST({ version: "10" }).setToken(env.token);

async function registerCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");

    const route = env.guildId
      ? Routes.applicationGuildCommands(env.applicationId, env.guildId)
      : Routes.applicationCommands(env.applicationId);

    await rest.put(route, { body: commands });

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error(error, "Failed to register commands");
    process.exit(1);
  }
}

registerCommands();

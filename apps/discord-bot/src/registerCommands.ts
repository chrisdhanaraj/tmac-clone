import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { env } from "./env.js";
import { data as matchCommand } from "./commands/match.js";
import { data as rankCommand } from "./commands/rank.js";
import { logger } from "@tmac/shared/logger";

const commands = [matchCommand.toJSON(), rankCommand.toJSON()];

// this is the HTTP client abstraction for the Discord API
const rest = new REST({ version: "10" }).setToken(env.token);

async function registerCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");

    // If guildId is present, register to that guild and clear global commands to prevent duplicates
    if (env.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(env.applicationId, env.guildId),
        { body: commands },
      );

      // Clear global commands
      await rest.put(Routes.applicationCommands(env.applicationId), {
        body: [],
      });

      logger.info(
        `Successfully reloaded guild application (/) commands for guild ${env.guildId}. Global commands cleared.`,
      );
    } else {
      // Register commands globally (for DMs)
      await rest.put(Routes.applicationCommands(env.applicationId), {
        body: commands,
      });
      logger.info("Successfully reloaded global application (/) commands.");
    }
  } catch (error) {
    logger.error(error, "Failed to register commands");
    process.exit(1);
  }
}

registerCommands();

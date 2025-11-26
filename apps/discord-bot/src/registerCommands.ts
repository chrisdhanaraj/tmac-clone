import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { env } from "./env.js";
import { data as matchCommand } from "./commands/match.js";
import { data as rankCommand } from "./commands/rank.js";
import { logger } from "@tmac/shared/logger";

// Commands available globally (including DMs)
const globalCommands = [rankCommand.toJSON()];

// Commands only available in guilds
const guildCommands = [matchCommand.toJSON()];

// this is the HTTP client abstraction for the Discord API
const rest = new REST({ version: "10" }).setToken(env.token);

async function registerCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");

    // Register global commands (available everywhere including DMs)
    await rest.put(Routes.applicationCommands(env.applicationId), {
      body: globalCommands,
    });
    logger.info(
      `Successfully registered ${globalCommands.length} global command(s).`,
    );

    // Register guild-only commands if guildId is present
    if (env.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(env.applicationId, env.guildId),
        { body: guildCommands },
      );
      logger.info(
        `Successfully registered ${guildCommands.length} guild command(s) for guild ${env.guildId}.`,
      );
    } else {
      logger.warn(
        "No DISCORD_GUILD_ID set - guild-only commands will not be registered.",
      );
    }
  } catch (error) {
    logger.error(error, "Failed to register commands");
    process.exit(1);
  }
}

registerCommands();

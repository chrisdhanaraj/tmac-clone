import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { env } from "./env.js";
import { data as pingCommand } from "./commands/ping.js";
import { data as matchCommand } from "./commands/match.js";
import { data as welcomeCommand } from "./commands/welcome.js";
import { data as verifyCommand } from "./commands/verify.js";
import { logger } from "@tmac/shared/logger";

const commands = [
  pingCommand.toJSON(),
  matchCommand.toJSON(),
  welcomeCommand.toJSON(),
  verifyCommand.toJSON(),
];

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

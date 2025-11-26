import { config } from "dotenv";

config();

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  token: requiredEnv("DISCORD_TOKEN"),
  applicationId: requiredEnv("DISCORD_APPLICATION_ID"),
  guildId: process.env["DISCORD_GUILD_ID"],
  frontOfficeUrl: requiredEnv("FRONT_OFFICE_URL"),
  loopsApiKey: requiredEnv("LOOPS_API_KEY"),
  loopsTransactionalEmailTemplateId: requiredEnv(
    "LOOPS_TRANSACTIONAL_EMAIL_TEMPLATE_ID"
  ),
  webhookSecret: requiredEnv("DISCORD_WEBHOOK_SECRET"),
  port: parseInt(requiredEnv("PORT"), 10),
};

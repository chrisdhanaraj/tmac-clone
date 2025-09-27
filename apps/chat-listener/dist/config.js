import { config as envConfig } from 'dotenv';
import { z } from 'zod';
envConfig();
const configSchema = z.object({
    DISCORD_TOKEN: z.string(),
    GUILD_ID: z.string().optional().default('1413213802660495543'), // Mission Athletic Club
    FRONT_OFFICE_URL: z.string().optional().default('http://localhost:5173'),
});
export const config = configSchema.parse({
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    GUILD_ID: process.env.GUILD_ID,
    FRONT_OFFICE_URL: process.env.FRONT_OFFICE_URL,
});

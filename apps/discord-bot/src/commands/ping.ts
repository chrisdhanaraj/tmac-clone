import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(interaction: ChatInputCommandInteraction) {
  const reply = await interaction.reply({
    content: "🏓 Pinging...",
    fetchReply: true,
  });

  const latency = reply.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`🏓 Pong! Latency: ${latency}ms`);
}

import { ButtonInteraction, ThreadAutoArchiveDuration } from "discord.js";
import { logger } from "@tmac/shared/logger";

export async function handleJoinMatch(
  interaction: ButtonInteraction,
  _matchId: string
) {
  try {
    // 1. Get the message that triggered this
    const message = interaction.message;
    if (!message) {
      await interaction.reply({
        content: "Could not find the message to reply to.",
        ephemeral: true,
      });
      return;
    }

    // 2. Check if a thread already exists or create one
    let thread = message.thread;
    if (!thread) {
      // Parse basic info from message content to name the thread
      // Content format: "🗓️ Date\n⏰ Time\n📍 Court..."
      const lines = message.content.split("\n");
      const dateLine = lines.find(l => l.includes("🗓️")) || "Date";
      const courtLine = lines.find(l => l.includes("📍")) || "Court";
      const date = dateLine.replace("🗓️", "").trim();
      const court = courtLine.replace("📍", "").trim();

      const threadName = `Match: ${court} - ${date}`.substring(0, 100);

      thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        reason: "Match coordination thread",
      });
    }

    // 3. Add user to thread and notify
    await thread.send({
      content: `<@${interaction.user.id}> is interested in this match! 🎾`,
    });

    // 4. Ephemeral reply
    await interaction.reply({
      content: "I've added you to the match thread! 🎾",
      ephemeral: true,
    });
  } catch (error) {
    logger.error(error, "Error handling join match button");
    if (!interaction.replied) {
      await interaction.reply({
        content: "Sorry, something went wrong joining the match.",
        ephemeral: true,
      });
    }
  }
}

export async function handleScheduleMatch(
  interaction: ButtonInteraction,
  creatorId: string,
  _matchId: string
) {
  try {
    // 1. Check permission
    if (interaction.user.id !== creatorId) {
      await interaction.reply({
        content:
          "Only the player who requested this match can mark it as scheduled.",
        ephemeral: true,
      });
      return;
    }

    // 2. Update message
    const message = interaction.message;
    if (!message) {
      await interaction.reply({
        content: "Could not find the message to update.",
        ephemeral: true,
      });
      return;
    }

    let content = message.content;

    // Simple text replacement or append status if not found (though our format doesn't have explicit status line in text, we'll append/modify)
    // Current format ends with Player: <@ID>
    // We'll prepend the status or just append it.
    // Plan said: Edit the original message embed/text to show status: SCHEDULED ✅.

    const scheduledText = "\n\n**STATUS: SCHEDULED ✅**";
    if (!content.includes(scheduledText)) {
      content += scheduledText;
    }

    await message.edit({
      content: content,
      components: [], // Remove buttons
    });

    await interaction.reply({
      content: "Match marked as scheduled! Happy hitting! 🎾",
      ephemeral: true,
    });
  } catch (error) {
    logger.error(error, "Error handling schedule match button");
    if (!interaction.replied) {
      await interaction.reply({
        content: "Sorry, something went wrong scheduling the match.",
        ephemeral: true,
      });
    }
  }
}

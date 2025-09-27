import type Eris from "eris";
import { Constants } from "eris";
import { config } from "../config.js";

export async function handleWelcomeMessage(
  interaction: Eris.CommandInteraction
) {
  console.log("handleWelcomeMessage called");
  // Get the target user ID from the command options
  const targetUserOption = interaction.data.options?.[0];
  const targetUser =
    targetUserOption?.type === Constants.ApplicationCommandOptionTypes.USER
      ? targetUserOption.value
      : undefined;
  console.log("Target user:", targetUser);

  // Acknowledge the interaction immediately
  console.log("Acknowledging interaction...");
  await interaction.acknowledge();

  try {
    // Call the front-office API to generate welcome message
    const apiUrl = `${config.FRONT_OFFICE_URL}/api/chat/welcome`;
    console.log("Making API call to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discordUserId: targetUser,
      }),
    });

    if (!response.ok) {
      throw new Error(`Front-office API error: ${response.status}`);
    }

    const { message } = await response.json();

    await interaction.editOriginalMessage({
      content: message,
    });
  } catch (error) {
    console.error("Error generating welcome message:", error);
    await interaction.editOriginalMessage({
      content: "Sorry, I encountered an error generating the welcome message.",
    });
  }
}

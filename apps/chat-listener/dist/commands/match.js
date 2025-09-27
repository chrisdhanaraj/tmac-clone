import { config } from '../config.js';
export async function handleMatchRequest(interaction) {
    console.log('handleMatchRequest called');
    const location = interaction.data.options?.[0]?.options?.[0]?.value;
    console.log('Location:', location);
    // Acknowledge the interaction immediately
    console.log('Acknowledging interaction...');
    await interaction.acknowledge();
    try {
        // Call the front-office API to create match request
        const apiUrl = `${config.FRONT_OFFICE_URL}/api/chat/match-request`;
        console.log('Making API call to:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                discordUserId: interaction.member?.id || interaction.user?.id,
                location,
                channelId: interaction.channel?.id,
            }),
        });
        if (!response.ok) {
            throw new Error(`Front-office API error: ${response.status}`);
        }
        const matchRequest = await response.json();
        // Format the match request as a message
        const message = `🎾 **Match Request**\n\n` +
            `**Player:** <@${interaction.member?.id || interaction.user?.id}>\n` +
            `**Location:** ${matchRequest.location}\n` +
            `**Status:** ${matchRequest.status || 'Open'}\n\n` +
            `React with 🎾 to join this match!`;
        await interaction.editOriginalMessage({
            content: message,
        });
    }
    catch (error) {
        console.error('Error creating match request:', error);
        await interaction.editOriginalMessage({
            content: 'Sorry, I encountered an error creating your match request.',
        });
    }
}

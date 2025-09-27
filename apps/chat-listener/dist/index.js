import { Client } from 'eris';
import { config } from './config.js';
import { handleWelcomeMessage } from './commands/welcome.js';
import { handleMatchRequest } from './commands/match.js';
const bot = new Client(config.DISCORD_TOKEN);
bot.on('ready', () => {
    console.log('Discord bot is ready!');
    const commands = [
        {
            name: 'internal_welcome_message',
            description: 'Generate a welcome message for a new user',
            options: [
                {
                    name: 'target',
                    description: 'The user to welcome',
                    type: 6, // USER
                    required: true,
                },
            ],
        },
        {
            name: 'match',
            description: 'Tennis match commands',
            options: [
                {
                    name: 'request',
                    description: 'Request a match at a specific location',
                    type: 1, // SUB_COMMAND
                    options: [
                        {
                            name: 'location',
                            description: 'Where you want to play',
                            type: 3, // STRING
                            required: true,
                        },
                    ],
                },
            ],
        },
    ];
    // Register slash commands
    commands.forEach(command => {
        bot
            .createGuildCommand(config.GUILD_ID, command)
            .then(() => console.log(`Registered command: ${command.name}`))
            .catch(console.error);
    });
});
bot.on('interactionCreate', async (interaction) => {
    console.log('Received interaction:', {
        type: interaction.type,
        commandName: interaction.data?.name,
        options: interaction.data?.options,
    });
    if (interaction.type === 2) {
        // APPLICATION_COMMAND
        const commandName = interaction.data.name;
        const options = interaction.data.options;
        try {
            console.log(`Processing command: ${commandName}`);
            if (commandName === 'internal_welcome_message') {
                await handleWelcomeMessage(interaction);
            }
            else if (commandName === 'match' && options?.[0]?.name === 'request') {
                await handleMatchRequest(interaction);
            }
            else {
                console.log('Unknown command or subcommand:', commandName, options);
            }
        }
        catch (error) {
            console.error('Error handling interaction:', error);
            const errorResponse = {
                type: 4,
                data: {
                    content: 'Sorry, something went wrong processing your command.',
                    flags: 64, // EPHEMERAL
                },
            };
            if (interaction.acknowledged) {
                bot.editOriginalMessage(interaction.token, errorResponse.data);
            }
            else {
                bot.createInteractionResponse(interaction.id, interaction.token, errorResponse);
            }
        }
    }
});
bot.on('error', (err) => {
    console.error('Discord bot error:', err);
});
bot.connect();

# Chat Listener

Discord bot for Mission Athletic Club tennis community management.

## Features

- Welcome message generation for new users
- Match request system for tennis players
- Integration with front-office member database

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment:
   - Copy `.env.example` to `.env` and set your Discord token
   - Ensure `DISCORD_TOKEN` is set
   - Optionally configure `FRONT_OFFICE_URL` (defaults to `http://localhost:3000`)

3. Start the bot:
   ```bash
   pnpm dev
   ```

## Commands

### `/internal_welcome_message target:@user`
Generates a personalized welcome message for a Discord user based on their membership status in the database.

### `/match request location:"Court 1"`
Creates a match request that other players can respond to. Posts the request to the channel where the command was used.

## Development

- `pnpm dev` - Start bot in development mode with auto-reload
- `pnpm start` - Start bot in production mode
- `pnpm build` - Compile TypeScript
- `pnpm typecheck` - Check TypeScript without building

## Architecture

The bot is a thin layer that makes HTTP calls to the front-office application for all data operations. This ensures consistency with the main application and centralizes business logic.
# Mission Athletic Club - Project Summary

## Overview
Tennis club management system with React Router front-office app and Discord bot integration for community management and matchmaking.

## Architecture

### apps/front-office/
- **Tech Stack**: React Router v7, Prisma ORM, Better Auth, PostgreSQL, TailwindCSS
- **Purpose**: Main web application for member management, court booking, tennis profiles
- **Database**: PostgreSQL with Prisma schema
- **Key Models**: `user`, `TennisProfile`, `booking`, `court`, `courtLocation`
- **API Routes**: Auth (`/api/auth/*`), Chat integration (`/api/chat/*`)

### apps/chat-listener/
- **Tech Stack**: Eris Discord library, TypeScript, Node.js
- **Purpose**: Discord bot for welcome messages and tennis match requests
- **Commands**:
  - `/internal_welcome_message target:@user` - Generate personalized welcome
  - `/match request location:"Court 1"` - Post match request to channel
- **Integration**: Makes HTTP calls to front-office APIs

## Key Features

1. **Member Management**: User profiles with tennis skill tracking
2. **Discord Integration**: Bot assigns roles, generates welcome messages
3. **Match Making**: Discord-based match request system
4. **Court Booking**: Reservation system for tennis courts
5. **Database Sync**: Discord users linked to member database via `discordId` field

## Environment Setup

### Database (Docker)
```bash
docker run --name tennis-club-db \
  -e POSTGRES_DB=tennis_club \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:15
```

### Required ENV Variables
- `DATABASE_URL` - PostgreSQL connection
- `DISCORD_TOKEN` - Bot token (shared between apps)
- `BETTER_AUTH_SECRET` - Auth encryption key

## Development Workflow

1. Start PostgreSQL: `docker start tennis-club-db`
2. Front-office: `cd apps/front-office && pnpm dev`
3. Discord bot: `cd apps/chat-listener && pnpm dev`
4. Database operations: `pnpm db:migrate`, `pnpm db:studio`

## API Integration Points

- `POST /api/chat/welcome` - Discord welcome message generation
- `POST /api/chat/match-request` - Tennis match request creation
- Both APIs expect Discord user ID and integrate with member database
# Mission Athletic Club - Front Office

Tennis club management application built with React Router, providing member management, court booking, and integration with Discord chat systems.

## Prerequisites

- Node.js 18+ and pnpm
- Docker (for database)
- PostgreSQL (via Docker or local installation)

## Features

- 🎾 Tennis member management
- 📅 Court booking system
- 🏆 Player skill tracking and profiles
- 🤖 Discord bot integration APIs
- 🔒 Authentication with Better Auth
- 📊 Database with Prisma ORM

## Getting Started

### Database Setup

Start a PostgreSQL database using Docker:

```bash
docker run --name tennis-club-db \
  -e POSTGRES_DB=tennis_club \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### Environment Setup

Create a `.env` file in the app root:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tennis_club"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/tennis_club"

# Discord Bot (if using chat-listener)
DISCORD_TOKEN=your_discord_bot_token

# Auth (Better Auth)
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

### Installation

Install dependencies using pnpm:

```bash
pnpm install
```

### Database Migration

Initialize and migrate the database:

```bash
pnpm db:migrate
pnpm db:seed
```

### Development

Start the development server:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Available Scripts

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm typecheck` - Type check TypeScript
- `pnpm test` - Run tests with Vitest
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with initial data

## API Endpoints

### Chat Integration

- `POST /api/chat/welcome` - Generate welcome messages for Discord users
- `POST /api/chat/match-request` - Create tennis match requests

### Authentication

- `/api/auth/*` - Better Auth endpoints for login/signup

## Database Schema

Key models:

- `user` - Club members with optional Discord integration
- `TennisProfile` - Player skill levels and tennis-specific data
- `booking` - Court reservations
- `court` - Tennis court information

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

TBD

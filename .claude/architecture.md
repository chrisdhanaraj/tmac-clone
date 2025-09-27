# System Architecture

## Application Structure

```
tmac/
├── apps/
│   ├── front-office/          # React Router web app
│   │   ├── app/
│   │   │   ├── features/
│   │   │   │   ├── auth/      # Better Auth integration
│   │   │   │   └── chat/      # Discord API endpoints
│   │   │   ├── lib/           # Prisma client, utilities
│   │   │   └── routes.ts      # Route configuration
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── package.json
│   └── chat-listener/         # Discord bot
│       ├── src/
│       │   ├── commands/      # Slash command handlers
│       │   ├── config.ts      # Environment configuration
│       │   └── index.ts       # Bot entry point
│       └── package.json
└── .claude/                   # Project documentation
```

## Data Flow

### Discord Bot → Front Office
1. User runs `/match request location:"Court 1"` in Discord
2. Bot receives interaction, extracts Discord user ID and location
3. Bot makes `POST /api/chat/match-request` to front-office
4. Front-office looks up user by `discordId` in database
5. Front-office returns match request data
6. Bot formats and posts message in Discord channel

### Welcome Message Flow
1. User runs `/internal_welcome_message target:@user`
2. Bot extracts target Discord user ID
3. Bot calls `POST /api/chat/welcome` with Discord ID
4. Front-office queries user + TennisProfile by `discordId`
5. Front-office generates personalized message based on membership status
6. Bot posts welcome message in Discord

## Database Schema Key Points

### User Model
- `discordId: String? @unique` - Links Discord users to members
- Relations: `TennisProfile`, `booking[]`, `userRole[]`, `userTennisRoles[]`

### TennisProfile Model
- Stores skill level, playing preferences
- One-to-one with User

## Technology Choices

- **React Router v7**: Modern full-stack React framework
- **Eris**: Lightweight Discord library for Node.js
- **Prisma**: Type-safe ORM with PostgreSQL
- **Better Auth**: Modern authentication solution
- **pnpm**: Fast package manager
- **Docker**: PostgreSQL database containerization
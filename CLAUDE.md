# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TMAC (Tennis Court Management Application) is a monorepo containing multiple applications. The main application is `front-office`, a modern full-stack web application built with React Router v7, Prisma, and PostgreSQL. It provides tennis court booking and event management capabilities with role-based authentication.

## Monorepo Structure

This is a pnpm workspace with multiple applications:

- `apps/front-office/` - Main React Router v7 application
- Future apps can be added to the `apps/` directory

## Architecture

- **Frontend**: React Router v7 with server-side rendering
- **Backend**: React Router v7 server functions with file-based API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with email/password and session management
- **Styling**: TailwindCSS v4 with CSS-in-JS and Shadcn/ui components
- **Package Manager**: pnpm with workspace configuration

## Development Commands

### Core Development (Front-office App)

```bash
# Install dependencies (from root)
pnpm install

# Start development server (front-office)
cd apps/front-office && pnpm dev

# Build for production (front-office)
cd apps/front-office && pnpm build

# Type check (front-office)
cd apps/front-office && pnpm typecheck

# Start production server (front-office)
cd apps/front-office && pnpm start
```

### Database Operations (Front-office App)

```bash
# Generate Prisma client
cd apps/front-office && pnpm db:generate

# Run migrations
cd apps/front-office && pnpm db:migrate

# Deploy migrations to production
cd apps/front-office && pnpm db:deploy

# Seed database with court data
cd apps/front-office && pnpm db:seed

# Open Prisma Studio
cd apps/front-office && pnpm db:studio

# Reset database (dev only)
cd apps/front-office && pnpm db:reset
```

### Docker (Front-office App)

```bash
# Build and run with Docker Compose
cd apps/front-office && docker-compose up --build
```

## Key Directories

- `apps/front-office/` - Main React Router application
- `apps/front-office/app/routes/` - File-based routing structure
- `apps/front-office/app/components/ui/` - Shadcn/ui components
- `apps/front-office/app/generated/prisma/` - Generated Prisma client and types
- `apps/front-office/prisma/` - Database schema, migrations, and seed data
- `apps/front-office/app/lib/` - Shared utilities (auth, Prisma client, schemas)

## Database Schema

Core entities:

- **User**: Authentication and profile data
- **Court**: Tennis courts with location and booking style
- **CourtLocation**: Court location groupings
- **Booking**: Court reservations
- **Role/UserRole**: Role-based access control

## Authentication Flow

- Uses Better Auth with session-based authentication
- Protected routes via `auth.server.ts` utilities
- Role-based access control for dashboard features
- Login/signup forms with validation

## Development Patterns

### React Router v7 Framework Mode Best Practices

- **Route Configuration**: Routes are defined in `apps/front-office/app/routes.ts` with URL patterns and file paths
- **Nested Routes**: Child routes inherit parent paths automatically, use `<Outlet/>` in parent components
- **Route Types**:
  - `route()` for standard routes with specific paths
  - `index()` for default child routes at parent URL
  - `layout()` for nesting without URL segments
  - `prefix()` for adding path prefixes to multiple routes
- **Dynamic Segments**: Use `:paramName` for URL parameters (auto-parsed into `params`)
- **Optional Segments**: Add `?` to make route segments optional
- **Splat Routes**: Use `*` for catch-all/404 routes
- **Route Modules**: Each route can export loader, action, component, headers, and error boundaries
- **Server-Side Data Loading**: Use `loader` functions for SSR data fetching
- **Form Handling**: Use `action` functions for form submissions and mutations (prefer JSON over FormData)
- **Type Safety**: Leverage TypeScript throughout route configuration and modules

### Component Architecture

- Shadcn/ui components in `apps/front-office/app/components/ui/`
- Custom blocks in `apps/front-office/app/components/blocks/`
- Hook-based state management with TanStack Query
- Form validation using React Hook Form + Zod schemas

### Data Management

- Prisma client for type-safe database access
- Generated types in `apps/front-office/app/generated/prisma/`
- CSV-based seeding for court data
- Server functions for API endpoints

## Environment Setup

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth session secret
- `BETTER_AUTH_URL` - Application base URL

## Front-office App Structure

The main application follows React Router v7 conventions:

- `apps/front-office/app/root.tsx` - Root layout with global styles
- `apps/front-office/app/routes.ts` - Route configuration
- Server-side rendering with Vite

## Working with Tailwind

@include rules/tailwindcss.md

## Working With React

@inlude rules/react.md

## Working with the Monorepo

When running commands for the front-office app:

1. Either navigate to `apps/front-office/` first, then run the command
2. Or run commands from the root with the full path context

Example workflows:

```bash
# Method 1: Navigate then run
cd apps/front-office
pnpm dev

# Method 2: Run from root with context
cd apps/front-office && pnpm dev
```

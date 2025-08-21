## Relevant Files

- `apps/front-office/app/features/roster/utils/mock-data.ts` - Static mock dataset for roster profiles (created)
- `apps/front-office/app/features/roster/types/roster.ts` - TypeScript interfaces for roster data (created)
- `apps/front-office/app/features/roster/components/player-card.tsx` - Player card component for grid/list view (to be created)
- `apps/front-office/app/features/roster/components/player-detail-modal.tsx` - Detailed player view modal (to be created)
- `apps/front-office/app/features/roster/components/roster-filters.tsx` - Filter controls component (to be created)
- `apps/front-office/app/features/roster/components/roster-grid.tsx` - Main roster grid/list view component (to be created)
- `apps/front-office/app/features/roster/routes/roster.tsx` - Main roster route page (to be created)
- `apps/front-office/app/routes.ts` - App routing configuration (needs modification)
- `apps/front-office/app/features/dashboard/components/AppSidebar.tsx` - Sidebar navigation (needs modification)
- `apps/front-office/prisma/schema.prisma` - Database schema (needs modification for new fields)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Create Mock Data Infrastructure

  - [x] 1.1 Define TypeScript interfaces for roster data (Player, Availability, PlayingStyle, etc.)
  - [x] 1.2 Create static mock player dataset with ~30 realistic SF players
  - [x] 1.3 Include diverse district representation (District 1-11)
  - [x] 1.4 Add availability data for each player (days + morning/evening/all day)
  - [x] 1.5 Add playing style preferences (Sets, Rallies, Serve Practice) to each player
  - [x] 1.6 Add match format preferences (singles, doubles, mixed) to players
  - [x] 1.7 Include 3-5 incomplete profile examples in dataset
  - [x] 1.8 Add Instagram handles, favorite players, and playlist songs

- [ ] 2.0 Build Initial Roster Page

  - [ ] 2.1 Create main roster route file at features/roster/routes/roster.tsx
  - [ ] 2.2 Set up basic page layout with header and content area
  - [ ] 2.3 Import and display mock data in simple format
  - [ ] 2.4 Add authentication check for logged-in members only
  - [ ] 2.5 Implement basic responsive container
  - [ ] 2.6 Add route to routes.ts configuration
  - [ ] 2.7 Update AppSidebar to activate roster link

- [ ] 3.0 Implement Roster Display and Layout

  - [ ] 3.1 Build player cards inline in the roster page
  - [ ] 3.2 Implement responsive grid view using CSS Grid
  - [ ] 3.3 Add player information display (name, district, skill level)
  - [ ] 3.4 Display social handles and personality info
  - [ ] 3.5 Implement alphabetical sorting by default
  - [ ] 3.6 Add loading states using Skeleton component
  - [ ] 3.7 Handle empty states and incomplete profiles gracefully

- [ ] 4.0 Add Search and Filter Functionality

  - [ ] 4.1 Build filter UI inline in the roster page
  - [ ] 4.2 Implement district/location filter with checkbox group
  - [ ] 4.3 Add skill level filter with range or multi-select
  - [ ] 4.4 Create availability filter with day/time matrix
  - [ ] 4.5 Add playing style filter with multi-select
  - [ ] 4.6 Implement name search with debounced input
  - [ ] 4.7 Add filter state management and combination logic
  - [ ] 4.8 Create mobile-friendly filter drawer/sheet

- [ ] 5.0 Create Player Detail Views

  - [ ] 5.1 Build player detail modal inline using Dialog component
  - [ ] 5.2 Display all allowed profile fields with proper layout
  - [ ] 5.3 Add Instagram handle as clickable external link
  - [ ] 5.4 Create upcoming events section with event cards
  - [ ] 5.5 Display all tennis roles with descriptions
  - [ ] 5.6 Add playlist song and favorite player info
  - [ ] 5.7 Implement modal navigation (previous/next player)

- [ ] 6.0 Extract Reusable Components

  - [ ] 6.1 Extract PlayerCard component from inline implementation
  - [ ] 6.2 Create PlayerAvatar component using existing Avatar
  - [ ] 6.3 Extract AvailabilityDisplay component
  - [ ] 6.4 Create PlayingStyleBadges component using Badge
  - [ ] 6.5 Extract TennisRoleBadges component
  - [ ] 6.6 Create ViewToggle component for grid/list switching
  - [ ] 6.7 Extract RosterFilters component

- [ ] 7.0 Add Mobile Optimizations and Integration

  - [ ] 7.1 Implement responsive grid breakpoints (1, 2, 3+ columns)
  - [ ] 7.2 Create touch-friendly filter controls
  - [ ] 7.3 Optimize player cards for mobile display
  - [ ] 7.4 Connect to event system for upcoming events display
  - [ ] 7.5 Integrate tennis roles from existing system
  - [ ] 7.6 Add proper error boundaries and error handling
  - [ ] 7.7 Test and optimize for various mobile devices

- [ ] 8.0 Update Database Schema
  - [ ] 8.1 Add availability fields to TennisProfile model
  - [ ] 8.2 Add matchFormatPreference enum and field
  - [ ] 8.3 Add playingStylePreference fields
  - [ ] 8.4 Add showInRoster boolean field for opt-out
  - [ ] 8.5 Create and run database migration
  - [ ] 8.6 Update generated Prisma client types

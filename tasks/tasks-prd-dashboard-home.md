## Relevant Files

- `app/features/dashboard/routes/home.tsx` - Clean Stripe-inspired dashboard with light theme, horizontal events ticker, and professional card design
- `app/features/dashboard/components/` - Directory for new dashboard components (each with colocated types)
- `app/components/ui/` - Existing UI components to leverage (card, button, badge, avatar, etc.)
- `app/features/dashboard/utils/mock-data.ts` - Mock data generator with the most recent 30 Match Play chat messages with preserved line breaks, MAC events, and real court locations (names changed for privacy)
- `app/app.css` - Global styles updated with Stripe-inspired theme using proper semantic CSS variables

### Notes

- Focus on building a visual prototype with dummy data before any backend integration
- Leverage existing UI components from the components/ui directory
- Maintain mobile-first approach throughout development
- Use TypeScript for all new components with types colocated in the same file
- All styling uses semantic theme variables (bg-card, text-foreground, border-border, etc.) instead of direct color classes for consistent theming

## Tasks

- [x] 1.0 Set up Dashboard Data Types and Mock Data

  - [x] 1.1 Create mock data utility file with generators for events, match results, and WhatsApp activities
  - [x] 1.2 Define TypeScript interfaces for Event, MatchResult, WhatsAppActivity, and User (colocated in components)
  - [x] 1.3 Generate sample data: 10+ events, 20+ match results, 15+ WhatsApp activities
  - [x] 1.4 Create constants for dummy player names, court locations, and event types

- [x] 2.0 Create Dashboard Layout Components

  - [x] 2.1 Replace current home.tsx with new dashboard implementation
  - [x] 2.2 Create DashboardHeader component with TMAC branding and user avatar
  - [x] 2.3 Build DashboardContainer with responsive grid layout (main content + sidebar on desktop)
  - [x] 2.4 Create HeroSection component with welcome message and quick action buttons
  - [x] 2.5 Apply clean Stripe-inspired light theme with professional styling

- [x] 3.0 Build Upcoming Events Section

  - [x] 3.1 Create EventCard component with event details, available spots, and join button
  - [x] 3.2 Build EventsList container component with horizontal scroll on mobile
  - [x] 3.3 Implement "View All Events" link/button
  - [x] 3.4 Add spot availability indicator with progress bar
  - [x] 3.5 Style cards with rounded corners, subtle borders per design specs

- [x] 4.0 Implement Recent Match Results Feed

  - [x] 4.1 Create MatchResultItem component with player names, scores, timestamp
  - [x] 4.2 Build MatchResultsFeed container with vertical scrolling list
  - [x] 4.3 Add reaction buttons (👏, 🎾, 🔥) with animated counters
  - [x] 4.4 Implement mock infinite scroll or "Load More" pagination
  - [x] 4.5 Add hover states and dividers between items

- [x] 5.0 Create Post Match Result Modal

  - [x] 5.1 Build PostMatchModal component using existing Dialog UI component
  - [x] 5.2 Create form with player name inputs (with autocomplete simulation)
  - [x] 5.3 Add score input fields with validation
  - [x] 5.4 Include optional notes/highlights textarea
  - [x] 5.5 Style with gradient primary button and form validation states

- [x] 6.0 Build WhatsApp Activity Feed Component

  - [x] 6.1 Create WhatsAppActivityItem with avatar, message preview, and timestamp
  - [x] 6.2 Build WhatsAppFeed container with fixed height and scroll
  - [x] 6.3 Simulate real-time updates by adding new items every 30 seconds
  - [x] 6.4 Add connection status indicator
  - [x] 6.5 Implement collapsible behavior for mobile view

- [x] 7.0 Implement Responsive Design

  - [x] 7.1 Create mobile layout (<768px) with stacked sections
  - [x] 7.2 Build tablet layout (768-1199px) with collapsed sidebar
  - [x] 7.3 Ensure desktop layout (1200px+) with two-column design works properly
  - [x] 7.4 Add mobile-specific features: horizontal scrolling event cards
  - [x] 7.5 Implement responsive grid layouts and spacing

- [ ] 8.0 Add Loading and Empty States
  - [ ] 8.1 Create skeleton loader components for events, match results, and activities
  - [ ] 8.2 Build empty state components with appropriate messaging and icons
  - [ ] 8.3 Add shimmer animation effects to skeleton loaders
  - [ ] 8.4 Implement loading states in all data-dependent sections
  - [ ] 8.5 Create error boundary component for graceful error handling

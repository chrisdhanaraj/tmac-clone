# Product Requirements Document: Tennis Roster

## Introduction/Overview

The Tennis Roster is a searchable directory feature for TMAC (Tennis Match and Community) that enables registered members to discover and connect with other tennis players in their San Francisco community. The roster focuses on helping players find suitable match partners based on location, skill level, and playing preferences while maintaining privacy and encouraging off-platform communication through WhatsApp.

## Goals

1. Enable members to discover tennis players in their local district/area
2. Help players find suitable match partners based on skill level and playing style
3. Create an engaging, mobile-first directory that encourages regular use
4. Facilitate connections while respecting user privacy
5. Integrate with existing event and role systems for a cohesive experience

## User Stories

1. **As a TMAC member**, I want to find tennis players in my district so that I can connect with nearby players for matches.

2. **As a tennis player**, I want to filter players by skill level and playing style so that I can find compatible match partners.

3. **As a mobile user**, I want to easily browse and search the roster on my phone so that I can find players while on the go.

4. **As a privacy-conscious member**, I want control over what information is displayed so that my personal details remain private.

5. **As an active player**, I want to see which players are available and their preferred playing styles so that I can reach out for the right type of session.

6. **As a community member**, I want to see players' Instagram handles and music preferences so that I can get a sense of their personality before connecting.

## Functional Requirements

1. **Search and Filter System**

   - 1.1 Filter by district/location
   - 1.2 Filter by tennis skill level (using existing TennisRanking enum)
   - 1.3 Filter by availability (days of week + morning/evening/all day)
   - 1.4 Filter by playing style (Sets, Rallies, Serve Practice)
   - 1.5 Search by player name
   - 1.6 Ability to combine multiple filters

2. **Player Profile Display**

   - 2.1 Show player name (first name and last initial)
   - 2.2 Display district/location
   - 2.3 Show tennis skill level
   - 2.4 Display Instagram handle (if provided)
   - 2.5 Show favorite tennis player
   - 2.6 Display playlist song
   - 2.7 Show all user tennis roles (e.g., Coach, Organizer)
   - 2.8 Display playing style preferences
   - 2.9 Show preferred match formats (singles, doubles, mixed)
   - 2.10 Display availability (days of week + morning/evening/all day)
   - 2.11 For incomplete profiles, show with limited available information

3. **Privacy Controls**

   - 3.1 Never display age, gender, ethnicity, or birth date
   - 3.2 Hide email and phone numbers from all views
   - 3.3 Only show profiles to logged-in TMAC members
   - 3.4 Allow users to opt-out of roster display entirely

4. **Mobile Optimization**

   - 4.1 Responsive design that works seamlessly on mobile devices
   - 4.2 Touch-friendly interface elements
   - 4.3 Fast loading times on mobile networks
   - 4.4 Intuitive mobile navigation and filtering

5. **Integration Features**

   - 5.1 Show upcoming events the player is attending
   - 5.2 Display user's tennis roles from the system
   - 5.3 Link to player's event history
   - 5.4 Show match statistics/history for the player

6. **User Interface**
   - 6.1 Grid or list view toggle for player cards
   - 6.2 Player cards with essential information at a glance
   - 6.3 Detailed view when clicking on a player
   - 6.4 Clear visual hierarchy for scanning
   - 6.5 Default sort order: alphabetical by name

## Non-Goals (Out of Scope)

1. In-app messaging or chat functionality
2. Direct court booking through player profiles
3. Payment processing or lesson booking
4. Tournament brackets or league standings
5. Real-time availability status
6. Player ratings or reviews
7. Photo galleries beyond profile images

## Design Considerations

- **Mobile-First Design**: Given the critical importance of mobile, design should start with mobile screens
- **Privacy-First Layout**: Ensure personal information is never accidentally displayed
- **Visual Consistency**: Use existing TMAC design system and components
- **Accessibility**: Ensure roster is accessible with proper ARIA labels and keyboard navigation
- **Performance**: Implement pagination or infinite scroll for large member lists

## Technical Considerations

1. **Data Source**: Utilize existing TennisProfile and user models from Prisma schema
2. **Authentication**: Integrate with existing auth system to ensure only members can view roster
3. **Caching**: Implement caching strategy for roster queries to improve performance
4. **Search**: Consider using database full-text search or search service for name searches
5. **Privacy**: Implement field-level access control for sensitive data
6. **Mobile Performance**: Optimize images and implement lazy loading
7. **Availability Structure**: Create structured fields for days of week and time preferences (morning/evening/all day)
8. **Match Format Preferences**: Add fields to TennisProfile for preferred match formats

## Success Metrics

1. **User Engagement**

   - Monthly active users viewing the roster
   - Average time spent on roster pages
   - Number of return visits per user
   - Search/filter usage statistics

2. **Connection Metrics**

   - Click-through rate on Instagram handles
   - Correlation between roster views and event attendance
   - Player profile completion rates

3. **Performance Metrics**
   - Page load time on mobile devices
   - Search response time
   - Error rates

## Decisions from Open Questions

1. **Incomplete Profiles**: Show players with incomplete profiles but display only the limited information available
2. **Default Sort Order**: Alphabetical by player name
3. **Gamification**: No gamification elements needed
4. **Availability Structure**: Days of the week with time preferences (morning/evening/all day)
5. **Match Formats**: Yes, add preferred match format options (singles, doubles, mixed) to the tennis profile
6. **Moderation Tools**: Not needed at this time
7. **Last Active Tracking**: Not needed, remove this feature
8. **Multiple Tennis Roles**: Display all tennis roles a player has

# Task List: Roster Profile Claiming (User Experience Phase)

## Relevant Files

- `apps/front-office/prisma/schema.prisma` - Update TennisProfile model to make userId nullable.
- `apps/front-office/app/features/profile/api/profile-matching.server.ts` - Server-side logic for matching users to existing tennis profiles.
- `apps/front-office/app/features/profile/components/profile-claiming-modal.tsx` - Modal component for profile claiming flow.
- `apps/front-office/app/features/profile/components/profile-claiming-modal.test.tsx` - Unit tests for profile claiming modal.
- `apps/front-office/app/features/profile/routes/profile-claiming/route.tsx` - Route handler for profile claiming page.
- `apps/front-office/app/features/profile/utils/profile-matching.ts` - Client-side utilities for profile matching logic.
- `apps/front-office/app/features/profile/utils/profile-matching.test.ts` - Unit tests for profile matching utilities.
- `apps/front-office/app/features/auth/api/auth.server.ts` - Update auth server to check for profile matches on login.
- `apps/front-office/app/features/dashboard/routes/dashboard.tsx` - Update dashboard to enforce profile claiming requirement.
- `apps/front-office/app/routes.ts` - Add profile claiming routes to routing configuration.
- `scripts/import-cleaned-csv.ts` - Script to import cleaned CSV data into database.
- `scripts/import-cleaned-csv.test.ts` - Unit tests for CSV import script.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The profile claiming flow should be mandatory and block access to other app features until completed.
- Ensure proper error handling for edge cases like network failures during claiming process.

## Tasks

- [ ] 1.0 Database Schema Updates

  - [ ] 1.1 Modify TennisProfile model to make userId field nullable (`userId String? @unique`)
  - [ ] 1.2 Create and run Prisma migration for schema changes
  - [ ] 1.3 Update any existing queries that assume userId is always present
  - [ ] 1.4 Add database indexes on email and phone fields for efficient matching
  - [ ] 1.5 Test schema changes with existing data

- [ ] 2.0 Profile Matching Logic Implementation

  - [ ] 2.1 Create server-side function to find profiles by email (exact, case-insensitive)
  - [ ] 2.2 Create server-side function to find profiles by phone (exact, normalized)
  - [ ] 2.3 Implement phone number normalization utility function
  - [ ] 2.4 Create combined matching function that checks both email and phone
  - [ ] 2.5 Add error handling for multiple profile matches
  - [ ] 2.6 Create unit tests for all matching logic functions

- [ ] 3.0 Profile Claiming UI Components

  - [ ] 3.1 Create ProfileClaimingModal component with profile information display
  - [ ] 3.2 Add confirmation dialog showing matched profile details
  - [ ] 3.3 Implement loading states during claiming process
  - [ ] 3.4 Add error handling UI for claiming failures
  - [ ] 3.5 Create responsive design that works on mobile and desktop
  - [ ] 3.6 Add accessibility features (ARIA labels, keyboard navigation)
  - [ ] 3.7 Write unit tests for ProfileClaimingModal component

- [ ] 4.0 Profile Claiming Flow Integration

  - [ ] 4.1 Update login/signup flow to check for existing profiles after authentication
  - [ ] 4.2 Implement mandatory claiming step that blocks dashboard access
  - [ ] 4.3 Create API endpoint for profile claiming action
  - [ ] 4.4 Update user session to include profile claiming status
  - [ ] 4.5 Add route protection to prevent bypassing claiming flow
  - [ ] 4.6 Handle edge cases (user already has profile, no matches found)
  - [ ] 4.7 Test complete user journey from login through claiming

- [ ] 5.0 Data Import Process (Cleaned CSV)
  - [ ] 5.1 Create script to read cleaned CSV file and validate format
  - [ ] 5.2 Implement batch import process for TennisProfile records
  - [ ] 5.3 Add progress tracking and logging for import process
  - [ ] 5.4 Handle import errors and rollback functionality
  - [ ] 5.5 Add verification step to ensure all records imported correctly
  - [ ] 5.6 Create command-line interface for running import script
  - [ ] 5.7 Write unit tests for import script functions

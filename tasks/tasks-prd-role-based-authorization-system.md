# Task List: Role-Based Authorization System

Based on the PRD: `prd-role-based-authorization-system.md`

## Relevant Files

- `apps/front-office/app/features/auth/api/auth.server.ts` - Update BetterAuth configuration with organization plugin and access control
- `apps/front-office/app/features/auth/api/auth-client.ts` - Add organization client plugin
- `apps/front-office/prisma/schema.prisma` - Add tennis roles tables and update schema
- `apps/front-office/scripts/init-organization.ts` - Initialization script for The Mission Athletic Club
- `apps/front-office/app/lib/auth-utils.ts` - Authorization utility functions for React Router
- `apps/front-office/app/lib/auth-utils.test.ts` - Unit tests for auth utilities
- `apps/front-office/app/features/tennis-roles/api/tennis-roles.server.ts` - Server-side tennis role utility functions (called within loaders/actions)
- `apps/front-office/app/features/tennis-roles/api/tennis-roles.server.test.ts` - Unit tests for tennis roles server utilities
- `apps/front-office/app/features/tennis-roles/types/tennis-roles.ts` - TypeScript types for tennis roles
- `apps/front-office/app/features/admin/routes/users.tsx` - Admin user management interface
- `apps/front-office/app/features/admin/routes/tennis-roles.tsx` - Admin tennis roles management interface
- `apps/front-office/app/features/admin/components/role-assignment-modal.tsx` - Modal for assigning roles to users
- `apps/front-office/app/features/admin/components/role-assignment-modal.test.tsx` - Unit tests for role assignment modal
- `apps/front-office/app/features/dashboard/routes/dashboard.tsx` - Update dashboard loader with role-based authorization
- `apps/front-office/app/features/events/routes/events/events.tsx` - Update events routes with permission checks
- `apps/front-office/app/features/events/routes/events/create-events.tsx` - Add authorization to event creation
- `apps/front-office/app/routes.ts` - Update route configuration for admin routes

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `pnpm dlx jest [optional/path/to/test/file]` to run tests
- Use `pnpm dlx prisma db push` to sync schema changes to database during development iteration
- Run the initialization script with `node --import tsx scripts/init-organization.ts`
- BetterAuth organization plugin will handle permission caching automatically
- Server-side functions should be called within React Router loaders/actions, not as standalone API endpoints

## Tasks

- [ ] 1.0 Configure BetterAuth Organization Plugin and Access Control

  - [ ] 1.1 Install and configure BetterAuth organization plugin in auth.server.ts
  - [ ] 1.2 Create custom access control statements for events, users, and roles resources
  - [ ] 1.3 Define custom roles (admin, event_manager, member) with specific permissions
  - [ ] 1.4 Add organization client plugin to auth-client.ts
  - [ ] 1.5 Push BetterAuth organization schema changes using pnpm dlx prisma db push
  - [ ] 1.6 Test organization plugin setup and role configuration

- [ ] 2.0 Create Database Schema Updates and Initialization Script

  - [ ] 2.1 Add tennisRoles table to Prisma schema with id, name, description, isActive fields
  - [ ] 2.2 Add userTennisRoles junction table for many-to-many relationship
  - [ ] 2.3 Push schema changes to database using pnpm dlx prisma db push
  - [ ] 2.4 Create initialization script to set up "The Mission Athletic Club" organization
  - [ ] 2.5 Add logic to migrate existing users to admin role in initialization script
  - [ ] 2.6 Add logic to set active organization for all existing sessions
  - [ ] 2.7 Create seed data for default tennis roles (host, feeder, marketing, etc.)
  - [ ] 2.8 Test initialization script and verify organization setup

- [ ] 3.0 Implement Tennis Roles Management System

  - [ ] 3.1 Create TypeScript types for tennis roles and user assignments
  - [ ] 3.2 Build server-side utility functions for tennis role CRUD operations (for use in loaders/actions)
  - [ ] 3.3 Create tennis role assignment/removal functions
  - [ ] 3.4 Add tennis role queries (get user roles, get role members, etc.)
  - [ ] 3.5 Implement admin-configurable tennis role creation
  - [ ] 3.6 Write unit tests for tennis roles server utility functions
  - [ ] 3.7 Test tennis role assignment and retrieval functionality

- [ ] 4.0 Build Authorization Utilities and Route Protection

  - [ ] 4.1 Create auth utility functions leveraging BetterAuth's hasPermission API
  - [ ] 4.2 Build wrapper functions for consistent permission checking in loaders
  - [ ] 4.3 Create utility functions for role-based authorization in actions
  - [ ] 4.4 Add error handling utilities that redirect to home page on permission denial
  - [ ] 4.5 Update dashboard loader to include role-based authorization checks
  - [ ] 4.6 Add permission checks to events routes (create, edit, delete)
  - [ ] 4.7 Implement client-side permission checking utilities using checkRolePermission
  - [ ] 4.8 Write comprehensive unit tests for all authorization utilities
  - [ ] 4.9 Test authorization flow across different user roles

- [ ] 5.0 Create Admin Interface for Role Management
  - [ ] 5.1 Create admin routes structure in routes.ts (protected by admin role)
  - [ ] 5.2 Build admin user management interface with role assignment capabilities
  - [ ] 5.3 Create role assignment modal component for system and tennis roles
  - [ ] 5.4 Build tennis roles management interface for creating/editing tennis roles
  - [ ] 5.5 Add user search and filtering functionality in admin interface
  - [ ] 5.6 Implement tennis role visibility for admins and event managers in user profiles
  - [ ] 5.7 Add role indicators in navigation/sidebar for admin and event manager users
  - [ ] 5.8 Create confirmation dialogs for role assignment/removal actions
  - [ ] 5.9 Write unit tests for admin interface components
  - [ ] 5.10 Test complete admin workflow: user management, role assignment, tennis role creation

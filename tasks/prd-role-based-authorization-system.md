# Product Requirements Document: Role-Based Authorization System

## Introduction/Overview

This feature implements a comprehensive role-based authorization system for the tennis club management application. The system will provide both system-level authorization (admin/event manager/normal user) and tennis-specific role management to organize club members effectively. The goal is to create a flexible, scalable authorization framework that can gate access to features and data while supporting the club's organizational structure.

## Goals

1. **Implement System-Level RBAC**: Create hierarchical permission system with Admin, Event Manager, and Member roles
2. **Tennis Role Management**: Enable assignment of tennis-specific organizational roles (host, feeder, marketing, etc.)
3. **Flexible Authorization Framework**: Build reusable authorization utilities for React Router loaders/actions
4. **Admin-Configurable Tennis Roles**: Allow admins to create and manage tennis roles dynamically
5. **Leverage BetterAuth Capabilities**: Integrate with existing BetterAuth organization plugin features
6. **Future-Proof Design**: Design system to support granular permissions and additional roles

## User Stories

### System Administrators

- As an admin, I want to view and edit all user details so I can manage user accounts
- As an admin, I want to create, delete, and manage user accounts so I can control access
- As an admin, I want to assign system roles to users so I can control their access levels
- As an admin, I want to assign tennis roles to users so I can organize club members
- As an admin, I want to create new tennis roles so I can adapt to changing organizational needs
- As an admin, I want to view comprehensive user profiles including all roles so I can make informed decisions

### Event Managers

- As an event manager, I want to create, edit, and delete any events so I can manage the club's event calendar
- As an event manager, I want to manage event registrations and participants so I can coordinate activities
- As an event manager, I want to view event analytics and reports so I can improve future events
- As an event manager, I want to see user roles in the interface so I can identify key organizers

### Members

- As a member, I want to view only published events so I can see what's available to me
- As a member, I want to see my own roles so I understand my responsibilities in the club
- As a member, I want to access player-facing features when they become available

### Tennis Role Holders

- As a tennis role holder, I want my role to be visible to admins and event managers so they can contact me for relevant activities
- As a tennis role holder, I want to understand my role's purpose within the club organization

## Functional Requirements

### System Roles & Permissions

1. **Role Hierarchy Implementation**

   - The system must implement a capability-based role hierarchy where admins inherit event manager permissions, and event managers inherit member permissions
   - The system must enforce mutually exclusive system roles (one per user)
   - The system must provide role inheritance for permission checks

2. **Admin Role Capabilities**

   - The system must allow admins to create, read, update, and delete user accounts
   - The system must allow admins to assign and revoke all types of roles
   - The system must allow admins to view all user data and system settings
   - The system must allow admins to manage system-wide configurations
   - The system must allow admins to access all event management features

3. **Event Manager Role Capabilities**

   - The system must allow event managers to create, read, update, and delete any events
   - The system must allow event managers to manage event registrations and participants
   - The system must allow event managers to view event analytics
   - The system must allow event managers to set event pricing and rules
   - The system must allow event managers to view user roles in the interface

4. **Member Role Capabilities**
   - The system must allow members to view only events with "ready" status
   - The system must hide administrative event properties (like status) from members
   - The system must prevent members from accessing admin or event management features
   - The system must allow members to access future player-facing capabilities

### Tennis/Event Roles Management

5. **Tennis Role Assignment**

   - The system must support multiple tennis roles per user
   - The system must allow admins to assign tennis roles: host, feeder, marketing, membership and culture, social, tmatch, partnerships & sponsorships, courtiers, policy
   - The system must enable admin-configurable tennis role creation and management
   - The system must store tennis roles separately from system roles

6. **Tennis Role Visibility**
   - The system must display tennis roles on user profiles for admins and event managers
   - The system must allow users to view their own tennis roles
   - The system must hide tennis roles from members when viewing other profiles

### Authorization Framework

7. **Route Protection**

   - The system must provide utility functions for React Router loaders and actions
   - The system must implement role-based route protection
   - The system must support both system role and capability-based authorization
   - The system must provide a reusable authorization abstraction layer

8. **Permission Checking**
   - The system must leverage BetterAuth's built-in `hasPermission()` API for server-side permission checks
   - The system must use BetterAuth's `checkRolePermission()` for client-side permission validation
   - The system must implement custom permission statements for events, users, and roles resources
   - The system must define granular actions (create, read, update, delete) for each resource

### BetterAuth Integration

9. **Organization Plugin Integration (Behind the Scenes)**
   - The system must use BetterAuth's organization plugin as the underlying infrastructure for tenant separation and permission management
   - The system must define custom organization member roles: admin, event_manager, member
   - The system must maintain a single "The Mission Athletic Club" organization that all users belong to, hidden from user interface
   - The system must extend BetterAuth's custom member roles with tennis-specific role assignments

### Database Schema Updates

10. **System Roles via BetterAuth Organization**

    - The system must utilize BetterAuth's existing `member` table with custom organization roles
    - The system must define custom roles in BetterAuth's role system: admin, event_manager, member
    - The system must seed "The Mission Athletic Club" organization with these custom member roles
    - The system must ensure all users are automatically added as members of The Mission Athletic Club organization

11. **Tennis Roles Table**

    - The system must create a `tennisRoles` table with: id, name, description, isActive, createdAt, updatedAt
    - The system must seed default tennis roles
    - The system must create a `userTennisRoles` junction table
    - The system must allow admin-configurable role creation

12. **BetterAuth Access Control System**
    - The system must define custom permission statements using BetterAuth's `createAccessControl()`
    - The system must configure custom roles (admin, event_manager, member) with specific permissions
    - The system must pass access control configuration to BetterAuth's organization plugin
    - The system must define resource-action permissions: events (create/read/update/delete), users (create/read/update/delete), roles (assign/remove)

## Non-Goals (Out of Scope)

1. **External Authentication Providers**: Integration with third-party SSO providers beyond BetterAuth's existing capabilities
2. **Complex Conditional Permissions**: Advanced rule-based permissions beyond role and capability checks
3. **Audit Logging**: Detailed permission audit trails (future enhancement)
4. **Permission Inheritance**: Complex permission inheritance beyond role hierarchy
5. **Multi-Tenancy**: Support for multiple tennis clubs in one instance
6. **Real-Time Permission Updates**: Live permission updates without session refresh

## Design Considerations

### User Experience

- **Consistent Interface**: Role indicators should be consistently displayed across admin and event manager interfaces
- **Clear Permissions**: Users should understand their access levels through clear UI feedback
- **Intuitive Role Assignment**: Admin interface for role assignment should be straightforward and error-resistant

### Technical Architecture

- **Utility Function Pattern**: Create reusable authorization utility functions for React Router loaders/actions
- **Session Integration**: Extend current session data to include role and capability information
- **Caching Strategy**: Implement permission caching to avoid repeated database queries
- **Type Safety**: Ensure full TypeScript support for all authorization utilities

### BetterAuth Integration Points

- **Organization Plugin (Behind the Scenes)**: Use organization plugin for underlying tenant separation and permission framework without exposing "organization" concept to users
- **Custom Role Definition**: Define custom organization member roles (admin, event_manager, member) within BetterAuth's role system
- **Tennis Role Layer**: Build tennis-specific roles as a separate layer on top of BetterAuth's custom organization member roles

## Technical Considerations

### Database Migration Strategy

- **Staged Rollout**: Implement system roles first, then tennis roles
- **Data Seeding**: Create seed scripts for default roles and capabilities
- **Backward Compatibility**: Ensure existing user accounts work during migration

### Performance Optimization

- **BetterAuth Caching**: Leverage BetterAuth's built-in permission caching mechanisms
- **Client-side Validation**: Use `checkRolePermission()` for immediate UI feedback without server calls
- **Efficient Queries**: Optimize role and permission lookups using BetterAuth's optimized database queries

### Security Considerations

- **Permission Validation**: Always validate permissions on both client and server
- **Session Security**: Ensure role information is securely stored in sessions
- **Privilege Escalation**: Prevent unauthorized role assignments

### React Router Integration

- **Loader Authorization**: Use BetterAuth's `auth.api.hasPermission()` directly in React Router loaders
- **Action Authorization**: Implement BetterAuth permission checks in all mutation actions
- **Utility Wrappers**: Create thin wrapper utilities around BetterAuth's permission APIs for consistent usage
- **Error Handling**: Provide consistent error responses for authorization failures using BetterAuth's permission results

## Implementation Examples

### **BetterAuth Configuration**

```typescript
// auth.server.ts
import { createAccessControl } from "better-auth/plugins/access";

// Start with subset of critical permissions based on implementation decisions
const statement = {
  events: ["read", "create", "update"], // Subset: no delete initially
  users: ["read", "update"], // Subset: no create/delete initially
  roles: ["assign"], // Subset: no remove initially
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
  events: ["read", "create", "update"],
  users: ["read", "update"],
  roles: ["assign"],
});

const eventManager = ac.newRole({
  events: ["read", "create", "update"],
  users: ["read"], // Can view user roles but not edit
});

const member = ac.newRole({
  events: ["read"], // Can only view published events
});

export const auth = betterAuth({
  plugins: [
    organization({
      ac,
      roles: { admin, event_manager: eventManager, member },
    }),
  ],
});
```

### **Initialization Script**

```typescript
// scripts/init-organization.ts
import { auth } from "../auth.server";
import { prisma } from "../lib/db";

async function initializeTennisClub() {
  console.log("Initializing The Mission Athletic Club organization...");

  // Create single tennis club organization (hidden from users)
  const org = await auth.api.createOrganization({
    body: {
      name: "The Mission Athletic Club",
      slug: "tmac",
      metadata: { isDefault: true },
    },
  });

  // Get all existing users and grant admin privileges (migration strategy)
  const existingUsers = await prisma.user.findMany();

  for (const user of existingUsers) {
    await auth.api.addMember({
      body: {
        userId: user.id,
        organizationId: org.id,
        role: "admin", // Give all existing users admin privileges
      },
    });
  }

  console.log(
    `✅ The Mission Athletic Club organization initialized with ${existingUsers.length} admin users`
  );

  // Set all user sessions to use this organization by default
  await prisma.session.updateMany({
    data: {
      activeOrganizationId: org.id,
    },
  });

  console.log("✅ Updated all existing sessions with active organization");
}

// Run: node --import tsx scripts/init-organization.ts
initializeTennisClub().catch(console.error);
```

### **React Router Loader Authorization**

```typescript
// Event management loader
export async function loader({ request }: Route.LoaderArgs) {
  const hasPermission = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      permissions: {
        events: ["read"],
      },
    },
  });

  if (!hasPermission) {
    // Redirect to home page as per implementation decision
    throw redirect("/?error=permission_denied");
  }

  // ... load events
}
```

### **Client-side Permission Checking**

```typescript
// In React components
function EventCreateButton() {
  const canCreate = authClient.organization.checkRolePermission({
    permissions: { events: ["create"] },
    role: "event_manager",
  });

  return canCreate ? <Button>Create Event</Button> : null;
}
```

### **Session Storage & Caching**

```typescript
// BetterAuth already handles session storage and caching
// We extend the session with organization/role info
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // BetterAuth session already includes:
  // - session.activeOrganizationId (from organization plugin)
  // - User role information cached in session
  // - Automatic permission caching

  if (session?.activeOrganizationId) {
    const org = await auth.api.getFullOrganization({
      headers: request.headers,
    });
    // org.members contains role info, already cached by BetterAuth
  }
}
```

## Success Metrics

1. **Security Compliance**: Zero unauthorized access incidents
2. **Performance**: Authorization checks under 50ms response time
3. **Usability**: Admin can assign roles without technical assistance
4. **Adoption**: 100% of protected routes use authorization framework
5. **Flexibility**: New tennis roles can be created without code changes

## Implementation Decisions

1. **BetterAuth Custom Role Implementation**: Create an initialization script to seed "The Mission Athletic Club" organization and define custom roles (admin, event_manager, member) with their permission statements
2. **Permission Granularity**: Start with a subset of CRUD actions - implement the most critical permissions first (e.g., events:read, events:create for event managers)
3. **Tennis Role Permissions**: Tennis roles will remain organizational only for now - no permission gating initially
4. **Session Storage**: Leverage BetterAuth's existing session management and caching - extend current user session data to include role information
5. **Migration Strategy**: Grant all existing users admin privileges during initial rollout to ensure no access disruption
6. **Error Handling**: Redirect users who lose permissions back to the home page with instruction to log back in
7. **Mobile Considerations**: No specific mobile authorization requirements at this time
8. **API Rate Limiting**: No role-based rate limiting needed initially

# Tennis Role Display Components

A comprehensive set of React components for displaying user roles in the TMAC (Tennis Court Management Application). These components provide beautiful, accessible, and functional role badges, lists, and user displays with full integration to the Prisma database schema.

## Components Overview

### 1. RoleBadge (`app/components/ui/role-badge.tsx`)

A single role badge component with intelligent styling based on role type.

**Features:**
- Automatic color coding based on role name (admin, tennis, member, system)
- Tooltips with role descriptions
- Inactive role indicators
- Removable badges with confirmation
- Multiple size variants (sm, md, lg)
- Accessibility support

**Usage:**
```tsx
import { RoleBadge } from "~/components/role-display";

// Basic usage
<RoleBadge role={{ id: "1", name: "Admin", description: "Full access" }} />

// With removal functionality
<RoleBadge 
  role={role} 
  removable 
  onRemove={(roleId) => handleRemoveRole(roleId)} 
/>

// Different sizes
<RoleBadge role={role} size="sm" />
<RoleBadge role={role} size="lg" />
```

### 2. RoleList (`app/components/blocks/role-list.tsx`)

A list component for displaying multiple roles with advanced features.

**Features:**
- Sorting by name or type
- Grouping by type or status
- Maximum display limits with overflow indicators
- Empty state handling
- Flexible spacing and alignment options
- Batch role removal

**Usage:**
```tsx
import { RoleList } from "~/components/role-display";

// Basic list
<RoleList roles={userRoles} />

// Grouped and sorted
<RoleList 
  roles={userRoles} 
  groupBy="type" 
  sortBy="name" 
/>

// With limits and management
<RoleList 
  roles={userRoles}
  maxDisplay={3}
  showOverflow={true}
  onRemoveRole={handleRoleRemove}
/>
```

### 3. UserRolesDisplay (`app/components/blocks/user-roles-display.tsx`)

A complete user role management component with user information and permissions.

**Features:**
- User information display
- Separate system and tennis role sections
- Loading and error states
- Editable mode with role removal
- Multiple layout variants (default, card, compact)
- Permission-aware display

**Usage:**
```tsx
import { UserRolesDisplay } from "~/components/role-display";

// Basic user display
<UserRolesDisplay user={user} showUserInfo={true} />

// Card layout with editing
<UserRolesDisplay 
  user={user}
  variant="card"
  editable={true}
  onRoleRemove={handleRoleRemove}
/>

// Loading state
<UserRolesDisplay loading={true} />

// Error state
<UserRolesDisplay error="Failed to load roles" />
```

## Type Definitions

### Core Types

```tsx
interface Role {
  id: string;
  name: string;
  description?: string;
}

interface TennisRole extends Role {
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: Array<{ role: Role }>;
  tennisRoles?: Array<{ tennisRole: TennisRole }>;
}
```

## Styling and Theming

The components use Tailwind CSS v4 with the following design principles:

- **Color Coding**: Automatic role type detection with consistent colors
  - Admin roles: Purple tones
  - Tennis roles: Emerald tones  
  - Member roles: Blue tones
  - System roles: Red tones
- **Spacing**: Consistent gap utilities for clean layouts
- **Typography**: Proper font sizing with line height modifiers
- **Dark Mode**: Full dark mode support with appropriate contrasts
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Integration with Prisma

The components are designed to work seamlessly with the TMAC Prisma schema:

```prisma
model user {
  roles         userRole[]
  tennisRoles   userTennisRoles[]
}

model role {
  id   String @id @default(uuid())
  name String @unique
}

model tennisRoles {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  isActive    Boolean  @default(true)
}
```

## Performance Considerations

- **Memoization**: Components use React.memo where appropriate
- **Efficient Rendering**: Minimal re-renders with proper key usage
- **Lazy Loading**: Support for loading states and progressive enhancement
- **Bundle Size**: Tree-shakeable exports and minimal dependencies

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG 2.1 AA compliant colors
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML structure and roles

## Examples and Testing

See the example files for comprehensive usage demonstrations:

- `app/components/ui/role-badge.stories.tsx` - Role badge examples
- `app/components/blocks/role-display-examples.tsx` - Complete component showcase

## API Reference

### RoleBadge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `Role \| TennisRole` | - | The role object to display |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"outline"` | Badge visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Badge size |
| `showTooltip` | `boolean` | `true` | Show description tooltip |
| `removable` | `boolean` | `false` | Show remove button |
| `onRemove` | `(roleId: string) => void` | - | Remove callback |

### RoleList Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `roles` | `(Role \| TennisRole)[]` | - | Array of roles to display |
| `sortBy` | `"name" \| "type" \| "none"` | `"name"` | Sort method |
| `groupBy` | `"type" \| "status" \| "none"` | `"none"` | Grouping method |
| `spacing` | `"sm" \| "md" \| "lg"` | `"md"` | Gap between badges |
| `alignment` | `"left" \| "center" \| "right"` | `"left"` | List alignment |
| `maxDisplay` | `number` | - | Maximum roles to show |
| `showOverflow` | `boolean` | `true` | Show "+X more" indicator |
| `onRemoveRole` | `(roleId: string) => void` | - | Role removal callback |

### UserRolesDisplay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `User \| UserWithFullRoles \| null` | - | User object with roles |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `showUserInfo` | `boolean` | `false` | Display user information |
| `showSystemRoles` | `boolean` | `true` | Show system roles section |
| `showTennisRoles` | `boolean` | `true` | Show tennis roles section |
| `editable` | `boolean` | `false` | Enable role removal |
| `variant` | `"default" \| "card" \| "compact"` | `"default"` | Layout variant |
| `onRoleRemove` | `(userId, roleId, roleType) => Promise<void>` | - | Role removal handler |

## Best Practices

1. **Use appropriate variants**: Choose the right component for your use case
2. **Provide loading states**: Always handle async operations gracefully
3. **Handle permissions**: Only show edit capabilities to authorized users
4. **Consistent styling**: Use the provided variants rather than custom styling
5. **Accessibility**: Test with screen readers and keyboard navigation
6. **Performance**: Use proper keys for list items and memoization where needed

## Migration Guide

If upgrading from previous role display implementations:

1. Replace individual badge implementations with `RoleBadge`
2. Consolidate role lists using `RoleList` with appropriate props
3. Use `UserRolesDisplay` for complete user role management
4. Update type imports to use the new component types
5. Test accessibility and responsive behavior

## Contributing

When contributing to these components:

1. Follow the established patterns and naming conventions
2. Add proper TypeScript types for all props and interfaces
3. Include accessibility features in new functionality
4. Update documentation and examples
5. Test with real data from the Prisma schema
6. Ensure compatibility with both light and dark themes
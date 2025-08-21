/**
 * Tennis Role Display Components
 * 
 * This module exports all role display components for the TMAC tennis application.
 * These components provide a complete solution for displaying user roles throughout the UI.
 */

// Core role badge component
export { RoleBadge, roleBadgeVariants } from "../ui/role-badge";
export type { RoleBadgeProps, Role, TennisRole } from "../ui/role-badge";

// Role list component for displaying multiple roles
export { RoleList, roleListVariants } from "../blocks/role-list";
export type { RoleListProps, SortOption, GroupOption } from "../blocks/role-list";

// User-specific role display component
export { 
  UserRolesDisplay, 
  UserRolesLoading, 
  UserRolesError, 
  userRolesDisplayVariants 
} from "../blocks/user-roles-display";
export type { 
  UserRolesDisplayProps, 
  User, 
  UserWithFullRoles 
} from "../blocks/user-roles-display";

// Example components for testing and documentation
export { default as RoleBadgeExamples } from "../ui/role-badge.stories";
export { default as RoleDisplayExamples } from "../blocks/role-display-examples";
/**
 * Auth Utilities - Capability-Based Authorization System
 * 
 * This module provides a capability-based authorization system for TMAC,
 * focusing on granular permissions rather than role-based checks.
 * 
 * Key Features:
 * - Capability-based permission checking (not role-based)
 * - PII access restrictions (only users with 'users:super' capability)
 * - Flexible role-to-capability mapping
 * - Server-side authorization for route loaders
 * - Client-side conditional UI rendering
 * 
 * Usage:
 * - Use `requirePermission()` in loaders for server-side authorization
 * - Use `hasPermission()` for conditional UI rendering
 * - Use `filterPIIFields()` to protect sensitive data
 * 
 * PII Protection:
 * Only users with 'users:super' capability can access:
 * - email, phone, ageRange, birthDate, ethnicity
 */

import { auth } from '~/features/auth/api/auth.server';
import type { User, Session } from 'better-auth/types';
import { redirect } from 'react-router';

// Type definitions for our capability-based auth system
export type Capability = 
  | 'events:read' 
  | 'events:create' 
  | 'events:update' 
  | 'events:delete'
  | 'users:read' 
  | 'users:create' 
  | 'users:update' 
  | 'users:delete' 
  | 'users:super'  // PII access capability
  | 'roles:assign' 
  | 'roles:remove';

export type Role = 'admin' | 'event_manager' | 'member';

export interface AuthUser extends User {
  roles?: Array<{ name: string }>;
}

export interface AuthSession extends Session {
  user: AuthUser;
}

// Capability mappings for each role
export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  admin: [
    'events:read', 'events:create', 'events:update', 'events:delete',
    'users:read', 'users:create', 'users:update', 'users:delete', 'users:super',
    'roles:assign', 'roles:remove'
  ],
  event_manager: [
    'events:read', 'events:create', 'events:update', 'events:delete',
    'users:read'
  ],
  member: [
    'events:read',
    'users:read'
  ]
};

// PII fields that require 'users:super' capability
export const PII_FIELDS = [
  'email',
  'phone', 
  'ageRange',
  'birthDate',
  'ethnicity'
] as const;

export type PIIField = typeof PII_FIELDS[number];

// Custom error classes
export class AuthorizationError extends Error {
  constructor(message: string, public capability?: Capability) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Get user capabilities based on their roles
 */
export function getUserCapabilities(user: AuthUser): Capability[] {
  if (!user.roles || user.roles.length === 0) {
    return [];
  }

  const capabilities = new Set<Capability>();
  
  for (const roleObj of user.roles) {
    // Skip null/undefined roles
    if (!roleObj || !roleObj.name) {
      continue;
    }
    
    const roleName = roleObj.name as Role;
    const roleCapabilities = ROLE_CAPABILITIES[roleName] || [];
    roleCapabilities.forEach(cap => capabilities.add(cap));
  }

  return Array.from(capabilities);
}

/**
 * Check if user has a specific capability
 */
export function hasPermission(user: AuthUser | null, capability: Capability): boolean {
  if (!user) {
    return false;
  }

  const userCapabilities = getUserCapabilities(user);
  return userCapabilities.includes(capability);
}

/**
 * Require a specific capability - throws if user lacks permission
 * Used in loaders for server-side authorization
 */
export async function requirePermission(
  request: Request, 
  capability: Capability
): Promise<AuthUser> {
  // Extract headers for auth check
  const headers = Object.fromEntries(request.headers.entries());
  
  try {
    const result = await auth.api.getSessionAndUser({ headers });
    
    if (!result.session || !result.user) {
      throw new AuthenticationError('Authentication required');
    }

    const user = result.user as AuthUser;
    
    if (!hasPermission(user, capability)) {
      throw new AuthorizationError(
        `Missing required capability: ${capability}`, 
        capability
      );
    }

    return user;
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      throw error;
    }
    // Handle other auth errors
    throw new AuthenticationError('Authentication failed');
  }
}

/**
 * Check if user can access PII fields
 */
export function canAccessPII(user: AuthUser | null): boolean {
  return hasPermission(user, 'users:super');
}

/**
 * Filter object to remove PII fields if user lacks permission
 */
export function filterPIIFields<T extends Record<string, any>>(
  data: T, 
  user: AuthUser | null
): Partial<T> {
  if (canAccessPII(user)) {
    return data;
  }

  const filtered = { ...data };
  PII_FIELDS.forEach(field => {
    if (field in filtered) {
      delete filtered[field];
    }
  });

  return filtered;
}

/**
 * Get user's role names
 */
export function getUserRoles(user: AuthUser | null): string[] {
  if (!user?.roles) {
    return [];
  }
  return user.roles.map(role => role.name);
}

/**
 * Handle authorization failures with appropriate redirects
 * For use in React Router loaders and actions
 */
export function handleAuthorizationError(error: unknown): never {
  if (error instanceof AuthenticationError) {
    // Redirect to login page for authentication failures
    throw redirect('/login?error=authentication_required');
  }
  
  if (error instanceof AuthorizationError) {
    // Redirect to home page with permission denied error for authorization failures
    throw redirect('/?error=permission_denied');
  }
  
  // For unknown errors, treat as authentication failure
  throw redirect('/login?error=auth_failed');
}

/**
 * Wrapper for requirePermission that handles redirects automatically
 * Use this in loaders for automatic error handling
 */
export async function requirePermissionWithRedirect(
  request: Request, 
  capability: Capability
): Promise<AuthUser> {
  try {
    return await requirePermission(request, capability);
  } catch (error) {
    handleAuthorizationError(error);
  }
}

/**
 * Create a protected loader that requires a specific capability
 * Returns a higher-order function that wraps your loader with auth
 */
export function createProtectedLoader<T>(capability: Capability) {
  return function protectedLoader(
    loaderFn: (user: AuthUser, ...args: any[]) => Promise<T> | T
  ) {
    return async function (args: any): Promise<T> {
      const { request } = args;
      const user = await requirePermissionWithRedirect(request, capability);
      return loaderFn(user, args);
    };
  };
}

/**
 * Create a protected action that requires a specific capability
 * Returns a higher-order function that wraps your action with auth
 */
export function createProtectedAction<T>(capability: Capability) {
  return function protectedAction(
    actionFn: (user: AuthUser, ...args: any[]) => Promise<T> | T
  ) {
    return async function (args: any): Promise<T> {
      const { request } = args;
      const user = await requirePermissionWithRedirect(request, capability);
      return actionFn(user, args);
    };
  };
}
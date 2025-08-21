import { redirect } from "react-router";
import { auth } from "~/features/auth/api/auth.server";
import type { AuthSession } from "~/types/common";

/**
 * Requires authentication for a route
 * Redirects to login if not authenticated
 * @param request - The request object
 * @param redirectTo - Where to redirect if not authenticated (default: "/")
 * @returns The authenticated session
 */
export async function requireAuth(
  request: Request,
  redirectTo: string = "/"
): Promise<AuthSession> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect(redirectTo);
  }

  return session as AuthSession;
}

/**
 * Gets the current session without requiring authentication
 * @param request - The request object
 * @returns The session or null
 */
export async function getOptionalAuth(
  request: Request
): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session as AuthSession | null;
}

/**
 * Checks if a user has a specific role
 * @param session - The auth session
 * @param role - The role to check
 * @returns Whether the user has the role
 */
export function hasRole(session: AuthSession, role: string): boolean {
  // This would need to be implemented based on your role system
  // For now, returning false as placeholder
  return false;
}

/**
 * Checks if a user has any of the specified roles
 * @param session - The auth session
 * @param roles - Array of roles to check
 * @returns Whether the user has any of the roles
 */
export function hasAnyRole(session: AuthSession, roles: string[]): boolean {
  return roles.some((role) => hasRole(session, role));
}

/**
 * Common types used across the application
 */

import type {
  user as User,
  session as Session,
} from "~/generated/prisma/client";

// User type from better-auth with our custom fields
// Using Prisma's generated user type
export type AuthUser = User;

// Session type - combining Prisma's session with user
export interface AuthSession {
  user: AuthUser;
  session: Session;
}

// Common async states
export type AsyncStatus = "idle" | "loading" | "success" | "error";

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

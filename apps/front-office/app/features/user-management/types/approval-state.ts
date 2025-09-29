/**
 * Type definitions for user approval loading states and error handling
 * Feature: 003-for-user-approval
 */

/**
 * Represents the current state of an approval operation for a specific user row
 */
export interface ApprovalOperationState {
  userId: string; // User ID being approved
  status: "idle" | "loading" | "success" | "error";
  error?: ApprovalError; // Error details if status is 'error'
  startedAt?: Date; // When operation began
  completedAt?: Date; // When operation completed/failed
}

/**
 * Error codes for approval operations
 */
export type ApprovalErrorCode =
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR";

/**
 * Standardized error information for approval operation failures
 */
export interface ApprovalError {
  code: ApprovalErrorCode;
  message: string; // User-friendly error message
  details?: unknown; // Technical details for debugging
  userId: string; // User ID that failed approval
  timestamp: Date; // When error occurred
  retryable: boolean; // Whether user can retry
}

/**
 * Tracks retry attempts for row data refresh after successful approval
 */
export interface RowRefetchState {
  userId: string; // User ID being refreshed
  attempt: number; // Current retry attempt (1-3)
  maxAttempts: number; // Maximum retry attempts (3)
  lastError?: Error; // Most recent error if failed
  backoffMs: number; // Current backoff delay (100, 200, 400)
}

/**
 * User-facing error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ApprovalErrorCode, string> = {
  TIMEOUT: "Approval timed out. Please try again.",
  NETWORK_ERROR: "Network error. Check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Session expired. Please log in again.",
  FORBIDDEN: "You do not have permission to approve users.",
  VALIDATION_ERROR: "Invalid request. Please refresh the page.",
};

/**
 * Helper function to create an ApprovalError from various error sources
 */
export function createApprovalError(
  error: unknown,
  userId: string
): ApprovalError {
  const timestamp = new Date();

  // Handle timeout errors
  if (error instanceof Error && error.message === "TIMEOUT") {
    return {
      code: "TIMEOUT",
      message: ERROR_MESSAGES.TIMEOUT,
      userId,
      timestamp,
      retryable: true,
    };
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      code: "NETWORK_ERROR",
      message: ERROR_MESSAGES.NETWORK_ERROR,
      userId,
      timestamp,
      retryable: true,
    };
  }

  // Handle HTTP error responses
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;

    switch (status) {
      case 401:
        return {
          code: "UNAUTHORIZED",
          message: ERROR_MESSAGES.UNAUTHORIZED,
          userId,
          timestamp,
          retryable: false,
        };
      case 403:
        return {
          code: "FORBIDDEN",
          message: ERROR_MESSAGES.FORBIDDEN,
          userId,
          timestamp,
          retryable: false,
        };
      case 400:
        return {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          userId,
          timestamp,
          retryable: false,
        };
      default:
        return {
          code: "SERVER_ERROR",
          message: ERROR_MESSAGES.SERVER_ERROR,
          userId,
          timestamp,
          retryable: true,
          details: error,
        };
    }
  }

  // Default to server error
  return {
    code: "SERVER_ERROR",
    message: ERROR_MESSAGES.SERVER_ERROR,
    userId,
    timestamp,
    retryable: true,
    details: error,
  };
}

/**
 * Calculate exponential backoff delay for retry attempts
 * Formula: 100 * 2^(attempt - 1) ms
 * - Attempt 1: 100ms
 * - Attempt 2: 200ms
 * - Attempt 3: 400ms
 */
export function calculateBackoff(attempt: number): number {
  return 100 * Math.pow(2, attempt - 1);
}

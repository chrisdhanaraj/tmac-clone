import { useState, useCallback } from "react";

interface ErrorDetails {
  message: string;
  code?: string;
  field?: string;
  details?: unknown;
}

interface UseErrorHandlerReturn {
  error: ErrorDetails | null;
  clearError: () => void;
  handleError: (error: unknown) => void;
  setFieldError: (field: string, message: string) => void;
}

/**
 * Hook for consistent error handling across the application
 * Provides utilities for managing and displaying errors
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      // Check for common error patterns
      const errorMessage = err.message;

      // Authentication errors
      if (errorMessage.includes("Invalid email or password")) {
        setError({
          message: "Invalid email or password",
          code: "AUTH_INVALID_CREDENTIALS",
        });
      }
      // Network errors
      else if (
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("network")
      ) {
        setError({
          message: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR",
        });
      }
      // Validation errors
      else if (errorMessage.includes("validation")) {
        setError({
          message: errorMessage,
          code: "VALIDATION_ERROR",
        });
      }
      // Default error
      else {
        setError({
          message: errorMessage,
          code: "UNKNOWN_ERROR",
          details: err.stack,
        });
      }
    } else if (typeof err === "string") {
      setError({
        message: err,
        code: "STRING_ERROR",
      });
    } else {
      setError({
        message: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
        details: err,
      });
    }
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setError({
      message,
      field,
      code: "FIELD_ERROR",
    });
  }, []);

  return {
    error,
    clearError,
    handleError,
    setFieldError,
  };
}

/**
 * Helper function to format error messages for display
 */
export function formatErrorMessage(error: ErrorDetails): string {
  if (error.field) {
    return `${error.field}: ${error.message}`;
  }
  return error.message;
}

/**
 * Helper function to check if an error is a specific type
 */
export function isErrorType(error: ErrorDetails | null, code: string): boolean {
  return error?.code === code;
}

import { useState, useCallback } from "react";

export type FormStatus = "idle" | "submitting" | "success" | "error";

interface UseFormSubmitReturn<T> {
  status: FormStatus;
  error: string | null;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  submit: (fn: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Hook for managing form submission state
 * Provides consistent status tracking, error handling, and loading states
 */
export function useFormSubmit<T = unknown>(): UseFormSubmitReturn<T> {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const submit = useCallback(async (fn: () => Promise<T>) => {
    setStatus("submitting");
    setError(null);

    try {
      const result = await fn();
      setStatus("success");
      return result;
    } catch (err) {
      setStatus("error");
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      // Re-throw to allow component-specific handling if needed
      throw err;
    }
  }, []);

  return {
    status,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    isError: status === "error",
    submit,
    reset,
  };
}

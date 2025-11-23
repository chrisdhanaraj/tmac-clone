import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  type ApprovalError,
  createApprovalError,
} from "~/features/user-management/types/approval-state";
import type { UserDisplay } from "../validation/user-approval.schema";

/**
 * Hook for managing user approval mutations with timeout and error handling
 * @param userId - The ID of the user to approve
 * @returns approve function that returns the updated user data
 */
export function useApprovalMutation(userId: string) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<ApprovalError | null>(null);

  /**
   * Approve a user with 5-second timeout
   * @returns The updated user data from the API response
   */
  const approve = useCallback(async (): Promise<UserDisplay | null> => {
    setIsApproving(true);
    setError(null);

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), 5000);
      });

      // Create approval request promise
      const approvalPromise = fetch("/api/users/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: [userId] }),
      });

      // Race between approval and timeout
      const response = await Promise.race([approvalPromise, timeoutPromise]);

      if (!response.ok) {
        throw { status: response.status };
      }

      // Parse response to get updated user data
      const data = await response.json();

      // Extract the user data for this userId from results
      const result = data.results?.find(
        (r: { userId: string; user: unknown }) => r.userId === userId
      );
      const userData = result?.user as UserDisplay | undefined;

      // Success - clear error state
      setError(null);

      return userData || null;
    } catch (err) {
      // Create standardized error
      const approvalError = createApprovalError(err, userId);
      setError(approvalError);

      // Show toast notification
      toast.error(approvalError.message, {
        duration: 5000,
      });

      throw approvalError;
    } finally {
      setIsApproving(false);
    }
  }, [userId]);

  /**
   * Reset error state
   */
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    approve,
    isApproving,
    error,
    reset,
  };
}

import { useState } from "react";
import { toast } from "sonner";
import type { UserDisplay } from "../validation/user-approval.schema";

/**
 * Hook for managing bulk user approval operations
 */
export function useBulkApproval() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveUsers = async (userIds: string[]): Promise<UserDisplay[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve users");
      }

      // Extract successfully approved users with full data
      const updatedUsers: UserDisplay[] = data.results
        .filter(
          (r: { success: boolean; user?: UserDisplay }) => r.success && r.user
        )
        .map((r: { user: UserDisplay }) => r.user);

      // Show success toast with count (3 second duration)
      const approvedCount = data.approvedCount || updatedUsers.length;
      const failedCount = data.failedCount || 0;

      if (failedCount > 0) {
        // Partial success
        toast.success(
          `${approvedCount} user${approvedCount === 1 ? "" : "s"} approved successfully. ${failedCount} failed.`,
          { duration: 3000 }
        );
      } else {
        // Full success
        toast.success(
          `${approvedCount} user${approvedCount === 1 ? "" : "s"} approved successfully`,
          { duration: 3000 }
        );
      }

      return updatedUsers;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);

      // Show error toast
      toast.error(`Failed to approve users: ${errorMessage}`, {
        duration: 5000,
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    approveUsers,
    isLoading,
    error,
  };
}

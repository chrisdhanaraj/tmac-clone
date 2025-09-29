import { useApprovalMutation } from "~/features/user-management/hooks/use-approval-mutation";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import type { UserDisplay } from "../validation/user-approval.schema";

interface ApprovalButtonProps {
  userId: string;
  isApproved: boolean;
  userEmail: string;
  onApprovalComplete?: (userId: string, userData: UserDisplay) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary";
}

/**
 * Approval button component with loading states and row-specific refresh
 */
export function ApprovalButton({
  userId,
  isApproved,
  userEmail,
  onApprovalComplete,
  size = "sm",
  variant,
}: ApprovalButtonProps) {
  const { approve, isApproving } = useApprovalMutation(userId);

  const handleApprove = async () => {
    try {
      // Approve the user and get updated data in response
      const userData = await approve();

      // Notify parent component with updated data
      if (userData && onApprovalComplete) {
        onApprovalComplete(userId, userData);
      }
    } catch (err) {
      // Error already handled by hooks (toast shown)
      console.error("Approval failed:", err);
    }
  };

  // Determine button text
  const buttonText = isApproving ? "" : isApproved ? "Approved" : "Approve";

  // Determine aria-label
  const ariaLabel = isApproving
    ? `Approving ${userEmail}`
    : isApproved
      ? `${userEmail} approved`
      : `Approve ${userEmail}`;

  // Determine variant (approved users get secondary style)
  const buttonVariant = variant || (isApproved ? "secondary" : "default");

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleApprove}
      disabled={isApproving || isApproved}
      aria-label={ariaLabel}
      aria-busy={isApproving}
    >
      {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface BulkApprovalActionsProps {
  selectedUserIds: string[];
  onBulkApprove: (userIds: string[]) => Promise<void>;
  onClearSelection?: () => void;
}

export function BulkApprovalActions({
  selectedUserIds,
  onBulkApprove,
  onClearSelection,
}: BulkApprovalActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const selectedCount = selectedUserIds.length;
  const isOverLimit = selectedCount > 100;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkApprove = async () => {
    setIsApproving(true);

    try {
      await onBulkApprove(selectedUserIds);

      // Clear checkbox selection state
      onClearSelection?.();

      // Auto-close on success
      setIsDialogOpen(false);
    } catch {
      // Error already shown via toast in hook
    } finally {
      setIsApproving(false);
    }
  };

  // Prevent dialog from closing during approval
  const handleOpenChange = (open: boolean) => {
    if (!isApproving) {
      setIsDialogOpen(open);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={isOverLimit}
            aria-describedby={isOverLimit ? "bulk-approve-error" : undefined}
          >
            Bulk Approve ({selectedCount})
          </Button>
        </DialogTrigger>

        <DialogContent
          onInteractOutside={e => {
            // Prevent closing dialog by clicking outside during approval
            if (isApproving) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Confirm Bulk Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedCount} users? This
              action cannot be undone. Each user will receive an email
              notification upon approval.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkApprove}
              disabled={isApproving}
            >
              {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isApproving ? "Approving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOverLimit && (
        <p id="bulk-approve-error" className="text-sm text-red-600">
          Maximum 100 users can be approved at once
        </p>
      )}
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkApprovalActions } from "../components/bulk-approval-actions";

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("BulkApprovalActions Component Tests", () => {
  const mockOnBulkApprove = vi.fn();
  const mockOnClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Bulk Action Visibility", () => {
    it("should show bulk approve button when users are selected", () => {
      render(
        <BulkApprovalActions
          selectedUserIds={["user-1", "user-2"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const approveButton = screen.getByRole("button", {
        name: /bulk approve/i,
      });
      expect(approveButton).toBeInTheDocument();
    });

    it("should hide bulk actions when no users are selected", () => {
      const { container } = render(
        <BulkApprovalActions
          selectedUserIds={[]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      // Component should not render anything when no selection
      expect(container.firstChild).toBeNull();
    });

    it("should show selected count in button text", () => {
      render(
        <BulkApprovalActions
          selectedUserIds={["user-1", "user-2", "user-3"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const button = screen.getByRole("button", { name: /bulk approve/i });
      expect(button).toHaveTextContent("3");
    });
  });

  describe("Bulk Approval Action", () => {
    it("should call approval handler when button is clicked", async () => {
      const user = userEvent.setup();
      mockOnBulkApprove.mockResolvedValue(undefined);

      render(
        <BulkApprovalActions
          selectedUserIds={["user-1", "user-2"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const approveButton = screen.getByRole("button", {
        name: /bulk approve/i,
      });
      await user.click(approveButton);

      // Dialog should open
      const confirmButton = await screen.findByRole("button", {
        name: /confirm/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalledWith(["user-1", "user-2"]);
      });
    });

    it("should show loading state during bulk approval", async () => {
      const user = userEvent.setup();
      let resolveApproval: (() => void) | undefined;
      const approvalPromise = new Promise<void>(resolve => {
        resolveApproval = resolve;
      });
      mockOnBulkApprove.mockReturnValue(approvalPromise);

      render(
        <BulkApprovalActions
          selectedUserIds={["user-1"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const approveButton = screen.getByRole("button", {
        name: /bulk approve/i,
      });

      await user.click(approveButton);

      const confirmButton = await screen.findByRole("button", {
        name: /confirm/i,
      });
      await user.click(confirmButton);

      // Confirm button should show loading state
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // Resolve the promise and wait for state updates to complete
      if (resolveApproval) {
        resolveApproval();
        await waitFor(() => {
          expect(confirmButton).not.toBeInTheDocument();
        });
      }
    });

    it("should enforce maximum user limit", () => {
      const manyUsers = Array.from({ length: 101 }, (_, i) => `user-${i}`);

      render(
        <BulkApprovalActions
          selectedUserIds={manyUsers}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const button = screen.getByRole("button", { name: /bulk approve/i });
      // Should show warning about exceeding limit and be disabled
      expect(button).toHaveTextContent("101");
      expect(button).toBeDisabled();

      // Should show error message
      expect(screen.getByText(/maximum 100 users/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle approval errors gracefully", async () => {
      const user = userEvent.setup();
      mockOnBulkApprove.mockRejectedValue(new Error("Approval failed"));

      render(
        <BulkApprovalActions
          selectedUserIds={["user-1"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const approveButton = screen.getByRole("button", {
        name: /bulk approve/i,
      });
      await user.click(approveButton);

      const confirmButton = await screen.findByRole("button", {
        name: /confirm/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalled();
      });

      // Dialog should remain open on error for retry
      expect(confirmButton).toBeInTheDocument();
    });

    it("should allow retry after failure", async () => {
      const user = userEvent.setup();
      mockOnBulkApprove
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockResolvedValueOnce(undefined);

      render(
        <BulkApprovalActions
          selectedUserIds={["user-1"]}
          onBulkApprove={mockOnBulkApprove}
          onClearSelection={mockOnClearSelection}
        />
      );

      const approveButton = screen.getByRole("button", {
        name: /bulk approve/i,
      });
      await user.click(approveButton);

      const confirmButton = await screen.findByRole("button", {
        name: /confirm/i,
      });

      // First attempt (fails)
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalledTimes(1);
      });

      // Retry (succeeds)
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalledTimes(2);
      });
    });
  });
});

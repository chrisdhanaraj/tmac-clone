import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApprovalButton } from "../../components/approval-button";

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the hooks
vi.mock("../../hooks/use-approval-mutation", () => ({
  useApprovalMutation: vi.fn(),
}));

import { useApprovalMutation } from "../../hooks/use-approval-mutation";

describe("ApprovalButton", () => {
  const mockApprove = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useApprovalMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      approve: mockApprove,
      isApproving: false,
      error: null,
      reset: mockReset,
    });
  });

  it("renders with 'Approve' text when not approved", () => {
    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Approve");
    expect(button).not.toBeDisabled();
  });

  it("renders with 'Approved' text when approved (disabled)", () => {
    render(
      <ApprovalButton
        userId="user-123"
        isApproved={true}
        userEmail="test@example.com"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Approved");
    expect(button).toBeDisabled();
  });

  it("shows loading spinner when isApproving=true", () => {
    (useApprovalMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      approve: mockApprove,
      isApproving: true,
      error: null,
      reset: mockReset,
    });

    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    // Look for loading indicator (spinner or loading text)
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("button is disabled during loading", () => {
    (useApprovalMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      approve: mockApprove,
      isApproving: true,
      error: null,
      reset: mockReset,
    });

    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls approve when clicked", async () => {
    const user = userEvent.setup();

    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockApprove).toHaveBeenCalledTimes(1);
  });

  it("aria-label updates during states", () => {
    const { rerender } = render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    let button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("test@example.com")
    );

    // Simulate loading state
    (useApprovalMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      approve: mockApprove,
      isApproving: true,
      error: null,
      reset: mockReset,
    });

    rerender(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Approving")
    );
  });

  it("aria-busy=true during loading", () => {
    (useApprovalMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      approve: mockApprove,
      isApproving: true,
      error: null,
      reset: mockReset,
    });

    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("calls onApprovalComplete with user data on success", async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockUserData = {
      id: "user-123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      approved: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock successful approval returning user data
    mockApprove.mockResolvedValue(mockUserData);

    render(
      <ApprovalButton
        userId="user-123"
        isApproved={false}
        userEmail="test@example.com"
        onApprovalComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith("user-123", mockUserData);
    });
  });
});

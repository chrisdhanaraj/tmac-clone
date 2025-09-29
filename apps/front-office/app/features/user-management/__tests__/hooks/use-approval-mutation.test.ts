import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApprovalMutation } from "../../hooks/use-approval-mutation";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("useApprovalMutation", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approve() calls POST /api/users/approve and returns user data", async () => {
    const mockUserData = {
      id: userId,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      approved: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          { userId, success: true, emailSent: true, user: mockUserData },
        ],
      }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    let returnedData;
    await act(async () => {
      returnedData = await result.current.approve();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/users/approve",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ userIds: [userId] }),
      })
    );

    expect(returnedData).toEqual(mockUserData);
  });

  it("isApproving state toggles correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            userId,
            success: true,
            emailSent: true,
            user: {
              id: userId,
              email: "test@example.com",
              firstName: "Test",
              lastName: "User",
              approved: true,
              emailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    expect(result.current.isApproving).toBe(false);

    // Approve and wait for completion
    await act(async () => {
      await result.current.approve();
    });

    // State should be false after completion
    expect(result.current.isApproving).toBe(false);
  });

  it("error state set on failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    await act(async () => {
      try {
        await result.current.approve();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe("SERVER_ERROR");
    expect(result.current.error?.userId).toBe(userId);
  });

  it("toast.error() called on failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    await act(async () => {
      try {
        await result.current.approve();
      } catch {
        // Expected to throw
      }
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Server error"),
      expect.any(Object)
    );
  });

  it("reset() clears error state", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    // Trigger error
    await act(async () => {
      try {
        await result.current.approve();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });

  it("handles 401 unauthorized errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    await act(async () => {
      try {
        await result.current.approve();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error?.code).toBe("UNAUTHORIZED");
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Session expired"),
      expect.any(Object)
    );
  });

  it("handles 403 forbidden errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useApprovalMutation(userId));

    await act(async () => {
      try {
        await result.current.approve();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error?.code).toBe("FORBIDDEN");
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("permission"),
      expect.any(Object)
    );
  });
});

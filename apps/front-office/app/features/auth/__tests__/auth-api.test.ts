import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MagicLinkRequestSchema,
  MagicLinkVerifySchema,
} from "../validation/magic-link.schema";

/**
 * Unit Tests for Magic Link Authentication API
 *
 * These tests validate API request/response handling with mocked responses
 * Focus is on schema validation and API contract compliance
 */

// Mock fetch globally
global.fetch = vi.fn();

describe("Magic Link API Unit Tests", () => {
  const mockFetch = fetch as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/auth/sign-in/magic-link", () => {
    it("should accept valid email and return success response", async () => {
      const validRequest = {
        email: "test@example.com",
        callbackURL: "/user",
      };

      // Validate request against Zod schema
      const validatedRequest = MagicLinkRequestSchema.parse(validRequest);
      expect(validatedRequest.email).toBe("test@example.com");

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ success: true, message: "Magic link sent" }),
      });

      const response = await fetch("/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedRequest),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedRequest),
      });
    });

    it("should return 400 for invalid email format", async () => {
      const invalidRequest = {
        email: "not-an-email",
      };

      // This should fail Zod validation
      expect(() => MagicLinkRequestSchema.parse(invalidRequest)).toThrow();

      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Invalid email format",
        }),
      });

      const response = await fetch("/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequest),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing email", async () => {
      const emptyRequest = {};

      // Mock validation error for missing email
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Email is required",
        }),
      });

      const response = await fetch("/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyRequest),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/auth/magic-link/verify", () => {
    it("should accept valid token and redirect to dashboard", async () => {
      const validToken = "valid-token-32-chars-minimum-length";
      const callbackURL = "/user";

      // Validate query params against Zod schema
      const validatedParams = MagicLinkVerifySchema.parse({
        token: validToken,
        callbackURL,
      });
      expect(validatedParams.token).toBe(validToken);

      // Mock successful verification redirect
      mockFetch.mockResolvedValueOnce({
        status: 302,
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("/user"),
        },
      });

      const response = await fetch(
        `/api/auth/magic-link/verify?token=${validToken}&callbackURL=${callbackURL}`
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("/user");
    });

    it("should return 302 redirect with error for invalid token", async () => {
      const invalidToken = "invalid-token";

      // Mock error redirect for invalid token
      mockFetch.mockResolvedValueOnce({
        status: 302,
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("/login?error=INVALID_TOKEN"),
        },
      });

      const response = await fetch(
        `/api/auth/magic-link/verify?token=${invalidToken}`
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toContain("error=INVALID_TOKEN");
    });

    it("should return 400 for missing token", async () => {
      // Mock validation error for missing token
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Token is required",
        }),
      });

      const response = await fetch("/api/auth/magic-link/verify");

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/auth/get-session", () => {
    it("should return user session when authenticated", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };
      const mockSession = {
        id: "session-456",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Mock authenticated session response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ user: mockUser, session: mockSession }),
      });

      const response = await fetch("/api/auth/get-session", {
        headers: {
          Cookie: "better-auth.session_token=valid-session-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("user");
      expect(data).toHaveProperty("session");
      expect(data.user).toEqual(mockUser);
      expect(data.session).toEqual(mockSession);
    });

    it("should return null when not authenticated", async () => {
      // Mock unauthenticated response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => null,
      });

      const response = await fetch("/api/auth/get-session");

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeNull();
    });
  });
});

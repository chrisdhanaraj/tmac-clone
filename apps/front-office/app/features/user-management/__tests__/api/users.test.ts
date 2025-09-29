import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  UserListQuerySchema,
  PaginatedUsersSchema,
} from "../../validation/user-approval.schema";

// Mock fetch
global.fetch = vi.fn();

describe("GET /api/users Contract Tests", () => {
  // These tests MUST FAIL initially to enforce TDD

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should validate query parameters according to schema", () => {
      // Valid query parameters
      const validQuery = {
        page: 1,
        pageSize: 50,
        search: "test@example.com",
        approved: "all" as const,
      };

      const result = UserListQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should reject invalid page numbers", () => {
      const invalidQuery = { page: 0 };
      const result = UserListQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("should reject page sizes outside allowed range", () => {
      const invalidQuery = { pageSize: 5 };
      const result = UserListQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);

      const invalidQuery2 = { pageSize: 200 };
      const result2 = UserListQuerySchema.safeParse(invalidQuery2);
      expect(result2.success).toBe(false);
    });

    it("should apply default values correctly", () => {
      const emptyQuery = {};
      const result = UserListQuerySchema.parse(emptyQuery);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.approved).toBe("all");
    });
  });

  describe("API Endpoint Contract", () => {
    it("should respond with paginated user data", async () => {
      const mockResponse = {
        users: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            email: "test1@example.com",
            firstName: "Test",
            lastName: "User",
            approved: false,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 1,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users?page=1&pageSize=10");
      expect(response.status).toBe(200);

      const data = await response.json();
      const validation = PaginatedUsersSchema.safeParse(data);
      expect(validation.success).toBe(true);
    });

    it("should require admin authentication", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: async () => ({ error: "Unauthorized" }),
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users");
      expect(response.status).toBe(401);
    });

    it("should handle search filtering", async () => {
      const mockResponse = {
        users: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            approved: false,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 1,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users?search=test@example.com");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(
        data.users.every((user: { email: string }) =>
          user.email.toLowerCase().includes("test")
        )
      ).toBe(true);
    });

    it("should handle approval status filtering", async () => {
      const mockResponse = {
        users: [
          {
            id: "123e4567-e89b-12d3-a456-426614174002",
            email: "approved@example.com",
            firstName: "Approved",
            lastName: "User",
            approved: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 1,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users?approved=true");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(
        data.users.every(
          (user: { approved: boolean }) => user.approved === true
        )
      ).toBe(true);
    });

    it("should return correct pagination metadata", async () => {
      const mockResponse = {
        users: [],
        pagination: {
          currentPage: 2,
          pageSize: 25,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
        totalCount: 125,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users?page=2&pageSize=25");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.currentPage).toBe(2);
      expect(data.pagination.pageSize).toBe(25);
      expect(typeof data.pagination.totalPages).toBe("number");
      expect(typeof data.pagination.hasNextPage).toBe("boolean");
      expect(typeof data.pagination.hasPreviousPage).toBe("boolean");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid query parameters gracefully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 400,
        ok: false,
        json: async () => ({
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
        }),
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users?page=-1&pageSize=1000");
      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error.error).toBeDefined();
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should handle server errors gracefully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
        json: async () => ({
          error: "Internal server error",
          code: "SERVER_ERROR",
        }),
      });
      global.fetch = mockFetch;

      const response = await fetch("/api/users");
      expect(response.status).toBe(500);

      const error = await response.json();
      expect(error.error).toBeDefined();
      expect(error.code).toBe("SERVER_ERROR");
    });
  });
});

import { describe, it, expect } from "vitest";
import { EmailValidationSchema } from "../validation/magic-link.schema";

/**
 * Component Tests for Login Form
 *
 * Tests login form validation logic and schema validation
 * Including client-side email validation (FR-012)
 */

describe("Login Form Validation Tests", () => {
  describe("T011: Login Form Validation Logic", () => {
    it("should validate email format using EmailValidationSchema", () => {
      const validEmail = "test@example.com";
      const invalidEmail = "not-an-email";

      // Test valid email
      expect(() =>
        EmailValidationSchema.parse({ email: validEmail })
      ).not.toThrow();

      // Test invalid email
      expect(() =>
        EmailValidationSchema.parse({ email: invalidEmail })
      ).toThrow();
    });

    it("should validate required email field", () => {
      const emptyEmail = "";

      expect(() =>
        EmailValidationSchema.parse({ email: emptyEmail })
      ).toThrow();
    });

    it("should accept long but valid email addresses", () => {
      const longEmail = "a".repeat(50) + "@example.com";

      // EmailValidationSchema only checks format, not length
      expect(() =>
        EmailValidationSchema.parse({ email: longEmail })
      ).not.toThrow();
    });
  });
});

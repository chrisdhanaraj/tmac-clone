/**
 * TennisProfile Field Validation Rules
 *
 * This file defines the validation constraints and requirements for each field
 * in the TennisProfile schema for the data cleaning process.
 */

import {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "./types";

/**
 * Field Requirements Classification
 */
export interface FieldRequirements {
  required: boolean;
  requiredForMatching: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  enumValues?: readonly string[];
  dataType: "string" | "date" | "enum" | "uuid";
  nullable: boolean;
}

/**
 * Complete field validation rules for TennisProfile
 */
export const TENNIS_PROFILE_VALIDATION_RULES: Record<
  string,
  FieldRequirements
> = {
  // System-generated fields (not from CSV)
  id: {
    required: true,
    requiredForMatching: false,
    dataType: "uuid",
    nullable: false,
  },

  userId: {
    required: false, // Will be null for imported profiles initially
    requiredForMatching: false,
    dataType: "uuid",
    nullable: true,
  },

  createdAt: {
    required: true,
    requiredForMatching: false,
    dataType: "date",
    nullable: false,
  },

  updatedAt: {
    required: true,
    requiredForMatching: false,
    dataType: "date",
    nullable: false,
  },

  // Required for matching (at least one must be present)
  email: {
    required: false, // Not schema required, but needed for matching
    requiredForMatching: true,
    dataType: "string",
    nullable: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  phone: {
    required: false, // Not schema required, but needed for matching
    requiredForMatching: true,
    dataType: "string",
    nullable: false,
    pattern: /^\+?[\d\s\-\(\)\.]+$/,
  },

  // Optional demographic fields
  gender: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(Gender),
  },

  ageRange: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(AgeRange),
  },

  ethnicity: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(Ethnicity),
  },

  birthDate: {
    required: false,
    requiredForMatching: false,
    dataType: "date",
    nullable: true,
  },

  // Optional profile fields with length constraints
  instagramHandle: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9._@\-\/\s]*$/,
  },

  district: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(District),
  },

  districtOther: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 100,
  },

  tmacGearPreference: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(TmacGearPreference),
  },

  tmacGearOther: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 100,
  },

  gearSize: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(GearSize),
  },

  playlistSong: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 200,
  },

  whyJoinTmac: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 500,
  },

  referredBy: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 100,
  },

  tennisRanking: {
    required: false,
    requiredForMatching: false,
    dataType: "enum",
    nullable: true,
    enumValues: Object.values(TennisRanking),
  },

  favoriteTennisPlayer: {
    required: false,
    requiredForMatching: false,
    dataType: "string",
    nullable: true,
    maxLength: 100,
  },

  lastReminderAt: {
    required: false,
    requiredForMatching: false,
    dataType: "date",
    nullable: true,
  },
};

/**
 * Required fields for successful import
 * At least one matching field (email OR phone) must be present
 */
export const MATCHING_REQUIREMENTS = {
  atLeastOneRequired: ["email", "phone"],
  message: "Record must have either email or phone number for matching",
} as const;

/**
 * Validation functions
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Should have at least 10 digits
  const digitCount = cleaned.replace(/\+/, "").length;
  return digitCount >= 10 && digitCount <= 15;
}

export function isValidInstagramHandle(handle: string): boolean {
  // Remove @ if present, check for valid Instagram username pattern
  const cleaned = handle.replace(/^@/, "");
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
  return instagramRegex.test(cleaned);
}

export function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr);
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() > 1900 &&
    date.getFullYear() < 2030
  );
}

export function isWithinLengthLimit(text: string, maxLength: number): boolean {
  return text.length <= maxLength;
}

/**
 * Validation error types
 */
export interface ValidationError {
  field: string;
  value: any;
  error: string;
  severity: "error" | "warning";
}

/**
 * Comprehensive field validator
 */
export function validateField(
  fieldName: string,
  value: any
): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = TENNIS_PROFILE_VALIDATION_RULES[fieldName];

  if (!rules) {
    errors.push({
      field: fieldName,
      value,
      error: `Unknown field: ${fieldName}`,
      severity: "warning",
    });
    return errors;
  }

  // Check if value is null/undefined
  if (value === null || value === undefined || value === "") {
    if (rules.required) {
      errors.push({
        field: fieldName,
        value,
        error: `Required field is missing`,
        severity: "error",
      });
    }
    return errors;
  }

  // Type-specific validation
  switch (rules.dataType) {
    case "string":
      if (typeof value !== "string") {
        errors.push({
          field: fieldName,
          value,
          error: `Expected string, got ${typeof value}`,
          severity: "error",
        });
        break;
      }

      // Length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field: fieldName,
          value,
          error: `Exceeds maximum length of ${rules.maxLength} characters`,
          severity: "error",
        });
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field: fieldName,
          value,
          error: `Below minimum length of ${rules.minLength} characters`,
          severity: "error",
        });
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field: fieldName,
          value,
          error: `Does not match required pattern`,
          severity: "error",
        });
      }

      // Special field validation
      if (fieldName === "email" && !isValidEmail(value)) {
        errors.push({
          field: fieldName,
          value,
          error: `Invalid email format`,
          severity: "error",
        });
      }

      if (fieldName === "phone" && !isValidPhoneNumber(value)) {
        errors.push({
          field: fieldName,
          value,
          error: `Invalid phone number format`,
          severity: "error",
        });
      }

      if (
        fieldName === "instagramHandle" &&
        value &&
        !isValidInstagramHandle(value)
      ) {
        errors.push({
          field: fieldName,
          value,
          error: `Invalid Instagram handle format`,
          severity: "warning",
        });
      }
      break;

    case "enum":
      if (rules.enumValues && !rules.enumValues.includes(value)) {
        errors.push({
          field: fieldName,
          value,
          error: `Invalid enum value. Expected one of: ${rules.enumValues.join(
            ", "
          )}`,
          severity: "error",
        });
      }
      break;

    case "date":
      if (!isValidDateString(value)) {
        errors.push({
          field: fieldName,
          value,
          error: `Invalid date format`,
          severity: "error",
        });
      }
      break;
  }

  return errors;
}

/**
 * Validate entire record for matching requirements
 */
export function validateMatchingRequirements(
  record: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if at least one matching field is present and valid
  const hasValidEmail = record.email && isValidEmail(record.email);
  const hasValidPhone = record.phone && isValidPhoneNumber(record.phone);

  if (!hasValidEmail && !hasValidPhone) {
    errors.push({
      field: "matching",
      value: { email: record.email, phone: record.phone },
      error: MATCHING_REQUIREMENTS.message,
      severity: "error",
    });
  }

  return errors;
}

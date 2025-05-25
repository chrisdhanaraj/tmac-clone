/**
 * Data Cleaning Utility Functions
 *
 * This file contains utility functions for phone normalization, email validation,
 * and other data cleaning operations for the TennisProfile data.
 */

/**
 * Phone number normalization
 * Standardizes phone numbers to a consistent format for matching
 */
export function normalizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Remove leading + if present
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading 1 for US numbers if length suggests it
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    cleaned = cleaned.substring(1);
  }

  // Should be exactly 10 digits for US numbers
  if (cleaned.length !== 10) {
    return null;
  }

  // Return in standard format: +1XXXXXXXXXX
  return `+1${cleaned}`;
}

/**
 * Email validation and normalization
 */
export function normalizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const cleaned = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Date parsing and normalization
 */
export function parseDate(dateValue: any): Date | null {
  if (!dateValue) {
    return null;
  }

  let date: Date;

  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === "string") {
    // Try parsing various date formats
    date = new Date(dateValue);
  } else {
    return null;
  }

  // Check if date is valid and reasonable
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() < 1900 ||
    date.getFullYear() > new Date().getFullYear()
  ) {
    return null;
  }

  return date;
}

/**
 * String cleaning utilities
 */
export function cleanString(value: any, maxLength?: number): string | null {
  if (!value) {
    return null;
  }

  const cleaned = String(value).trim();

  if (cleaned === "") {
    return null;
  }

  if (maxLength && cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength);
  }

  return cleaned;
}

/**
 * Instagram handle cleaning
 */
export function cleanInstagramHandle(handle: string): string | null {
  if (!handle) {
    return null;
  }

  let cleaned = handle.trim();

  // Remove @ symbol if present
  cleaned = cleaned.replace(/^@/, "");

  // Remove Instagram URL if present
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?instagram\.com\//, "");

  // Remove trailing slash
  cleaned = cleaned.replace(/\/$/, "");

  // Basic validation for Instagram username format
  if (cleaned && /^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Age range detection from numeric age
 */
export function detectAgeRange(age: any): string | null {
  const numAge = parseInt(String(age), 10);

  if (isNaN(numAge) || numAge < 18 || numAge > 100) {
    return null;
  }

  if (numAge >= 18 && numAge <= 25) {
    return "EIGHTEEN_TO_TWENTY_FIVE";
  } else if (numAge >= 26 && numAge <= 35) {
    return "TWENTY_SIX_TO_THIRTY_FIVE";
  } else if (numAge >= 36 && numAge <= 45) {
    return "THIRTY_SIX_TO_FORTY_FIVE";
  } else if (numAge >= 46 && numAge <= 55) {
    return "FORTY_SIX_TO_FIFTY_FIVE";
  } else if (numAge >= 56) {
    return "FIFTY_FIVE_PLUS";
  }

  return null;
}

/**
 * Generate unique ID for records
 */
export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deep clone utility for records
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two records represent the same person based on email/phone
 */
export function isSamePerson(record1: any, record2: any): boolean {
  const email1 = normalizeEmail(record1.email);
  const email2 = normalizeEmail(record2.email);
  const phone1 = normalizePhoneNumber(record1.phone);
  const phone2 = normalizePhoneNumber(record2.phone);

  // Same if emails match (and both exist)
  if (email1 && email2 && email1 === email2) {
    return true;
  }

  // Same if phones match (and both exist)
  if (phone1 && phone2 && phone1 === phone2) {
    return true;
  }

  return false;
}

/**
 * Detect partial matches (same email OR phone but not both)
 */
export function isPartialMatch(record1: any, record2: any): boolean {
  const email1 = normalizeEmail(record1.email);
  const email2 = normalizeEmail(record2.email);
  const phone1 = normalizePhoneNumber(record1.phone);
  const phone2 = normalizePhoneNumber(record2.phone);

  const emailMatch = email1 && email2 && email1 === email2;
  const phoneMatch = phone1 && phone2 && phone1 === phone2;

  // Partial match if exactly one field matches
  return (emailMatch && !phoneMatch) || (!emailMatch && phoneMatch);
}

/**
 * Create a hash key for deduplication
 */
export function createMatchingKey(record: any): string {
  const email = normalizeEmail(record.email);
  const phone = normalizePhoneNumber(record.phone);

  if (email && phone) {
    return `${email}|${phone}`;
  } else if (email) {
    return `email:${email}`;
  } else if (phone) {
    return `phone:${phone}`;
  }

  return "";
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedValue?: any;
}

/**
 * Comprehensive record validation
 */
export function validateRecord(record: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalized: any = {};

  // Email validation
  const email = normalizeEmail(
    record.email || record["Email"] || record["Email Address"]
  );
  if (email) {
    normalized.email = email;
  } else if (record.email || record["Email"] || record["Email Address"]) {
    errors.push("Invalid email format");
  }

  // Phone validation
  const phone = normalizePhoneNumber(record.phone || record["Phone Number"]);
  if (phone) {
    normalized.phone = phone;
  } else if (record.phone || record["Phone Number"]) {
    errors.push("Invalid phone number format");
  }

  // Must have at least email or phone
  if (!normalized.email && !normalized.phone) {
    errors.push("Record must have either valid email or phone number");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalizedValue: normalized,
  };
}

// Data cleaning and validation utilities
import { logger } from "@tmac/shared/logger";

export function cleanEmail(email: string): string | null {
  if (!email) return null;

  const cleaned = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function cleanPhone(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except + for international numbers
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Handle common formats
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    // US number with country code
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    // US number without country code
    return `+1${cleaned}`;
  } else if (cleaned.startsWith("+")) {
    // International number
    return cleaned;
  } else if (cleaned.length > 6) {
    // Assume it's a valid number, add + if missing
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  }

  return null;
}

export function cleanInstagramHandle(instagram: string): string | null {
  if (!instagram) return null;

  let cleaned = instagram.trim();

  // Remove common prefixes
  cleaned = cleaned.replace(
    /^(https?:\/\/)?(www\.)?(instagram\.com\/)?@?/,
    ""
  );

  // Remove trailing slashes or other characters
  cleaned = cleaned.replace(/[/\s]*$/, "");

  // Enforce database limit of 50 characters
  if (cleaned.length > 50) {
    logger.warn(
      `⚠️  Instagram handle too long, truncating: "${cleaned}" -> "${cleaned.substring(
        0,
        50
      )}"`
    );
    cleaned = cleaned.substring(0, 50);
  }

  // Basic validation - should be alphanumeric with dots and underscores
  if (cleaned && /^[a-zA-Z0-9._]{1,50}$/.test(cleaned)) {
    return cleaned;
  }

  // Handle special cases
  if (
    cleaned.toLowerCase().includes("don't have") ||
    cleaned.toLowerCase().includes("n/a") ||
    cleaned.toLowerCase().includes("none") ||
    cleaned.toLowerCase().includes("no instagram")
  ) {
    return null;
  }

  return cleaned || null;
}

export function parseBirthDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const cleaned = dateStr.trim();

  // Handle MM/DD format (assume current year if no year provided)
  const mmddMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (mmddMatch) {
    const month = parseInt(mmddMatch[1]);
    const day = parseInt(mmddMatch[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Use a reasonable birth year (assume adults between 18-65)
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 30; // Default to 30 years old
      return new Date(birthYear, month - 1, day);
    }
  }

  // Handle MM/DD/YYYY or MM/DD/YY formats
  const dateMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    let year = parseInt(dateMatch[3]);

    // Handle 2-digit years
    if (year < 100) {
      year += year > 30 ? 1900 : 2000;
    }

    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      year > 1900 &&
      year < 2010
    ) {
      return new Date(year, month - 1, day);
    }
  }

  // Try parsing as ISO date
  const isoDate = new Date(cleaned);
  if (
    !isNaN(isoDate.getTime()) &&
    isoDate.getFullYear() > 1900 &&
    isoDate.getFullYear() < 2010
  ) {
    return isoDate;
  }

  return null;
}

export function cleanText(text: string, maxLength?: number): string | null {
  if (!text) return null;

  const cleaned = text.trim();

  if (
    cleaned.toLowerCase() === "n/a" ||
    cleaned.toLowerCase() === "none" ||
    cleaned === ""
  ) {
    return null;
  }

  if (maxLength && cleaned.length > maxLength) {
    logger.warn(
      `⚠️  Text field too long, truncating from ${
        cleaned.length
      } to ${maxLength} characters: "${cleaned.substring(0, 100)}${
        cleaned.length > 100 ? "..." : ""
      }"`
    );
    return cleaned.substring(0, maxLength);
  }

  return cleaned;
}

export function cleanName(name: string): string | null {
  if (!name) return null;

  let cleaned = name.trim();

  // Remove common suffixes/notes in parentheses
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, "");

  // Handle names with quotes or special formatting
  cleaned = cleaned.replace(/["""]/g, "");

  // Basic validation - should contain letters
  if (cleaned && /[a-zA-Z]/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function parseBoolean(value: string): boolean {
  if (!value) return false;

  const normalized = value.toLowerCase().trim();
  return (
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "1" ||
    normalized === "y"
  );
}

export function parseTimestamp(timestamp: string): Date | null {
  if (!timestamp) return null;

  const cleaned = timestamp.trim();

  // Try parsing as-is first (handles ISO format and Google Forms format)
  const parsedDate = new Date(cleaned);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // Handle MM/DD/YYYY HH:MM:SS format (common Google Forms format)
  const formTimestampMatch = cleaned.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/
  );
  if (formTimestampMatch) {
    const month = parseInt(formTimestampMatch[1]);
    const day = parseInt(formTimestampMatch[2]);
    const year = parseInt(formTimestampMatch[3]);
    const hour = parseInt(formTimestampMatch[4]);
    const minute = parseInt(formTimestampMatch[5]);
    const second = parseInt(formTimestampMatch[6]);

    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59 &&
      second >= 0 &&
      second <= 59
    ) {
      return new Date(year, month - 1, day, hour, minute, second);
    }
  }

  logger.warn(`⚠️  Could not parse timestamp: "${cleaned}"`);
  return null;
}

/**
 * CSV Column to TennisProfile Schema Field Mapping
 *
 * This file defines how CSV columns from the roster data should be mapped
 * to TennisProfile schema fields during the data cleaning process.
 */

/**
 * CSV Column Mapping Configuration
 */
export interface ColumnMapping {
  csvColumn: string;
  schemaField: string;
  isRequired: boolean;
  transform?: (value: any) => any;
  description: string;
}

/**
 * Main CSV to Schema Field Mappings
 * Based on the actual CSV columns from the roster data
 */
export const CSV_TO_SCHEMA_MAPPING: ColumnMapping[] = [
  // Core identification fields
  {
    csvColumn: "Email",
    schemaField: "email",
    isRequired: false, // One of email/phone required
    description: "Primary email address for user matching",
  },
  {
    csvColumn: "Email Address",
    schemaField: "email",
    isRequired: false,
    description: "Alternative email field (fallback)",
  },
  {
    csvColumn: "Phone Number",
    schemaField: "phone",
    isRequired: false, // One of email/phone required
    description: "Phone number for user matching",
  },

  // Name fields (for reference, not in TennisProfile schema)
  {
    csvColumn: "First Name",
    schemaField: "firstName",
    isRequired: false,
    description: "First name (reference only, not stored in TennisProfile)",
  },
  {
    csvColumn: "Last Name",
    schemaField: "lastName",
    isRequired: false,
    description: "Last name (reference only, not stored in TennisProfile)",
  },

  // Demographic fields
  {
    csvColumn: "Which most closely describes your gender?",
    schemaField: "gender",
    isRequired: false,
    description: "Gender identity - maps to Gender enum",
  },
  {
    csvColumn: "Age",
    schemaField: "ageRange",
    isRequired: false,
    description: "Age bracket - maps to AgeRange enum",
  },
  {
    csvColumn: "Birth Date",
    schemaField: "birthDate",
    isRequired: false,
    description: "Date of birth",
  },
  {
    csvColumn: "Ethnicity",
    schemaField: "ethnicity",
    isRequired: false,
    description: "Ethnic background - maps to Ethnicity enum",
  },

  // Location fields
  {
    csvColumn: "District",
    schemaField: "district",
    isRequired: false,
    description: "SF District - maps to District enum",
  },

  // TMAC preferences
  {
    csvColumn: "Swag",
    schemaField: "tmacGearPreference",
    isRequired: false,
    description: "Preferred TMAC gear type - maps to TmacGearPreference enum",
  },
  {
    csvColumn: "Size",
    schemaField: "gearSize",
    isRequired: false,
    description: "Gear size preference - maps to GearSize enum",
  },

  // Tennis-related fields
  {
    csvColumn: "What is your Tennis Ranking?",
    schemaField: "tennisRanking",
    isRequired: false,
    description: "NTRP tennis ranking - maps to TennisRanking enum",
  },
  {
    csvColumn: "Favorite Player",
    schemaField: "favoriteTennisPlayer",
    isRequired: false,
    description: "Favorite tennis player name",
  },

  // Social and preference fields
  {
    csvColumn: "Instagram",
    schemaField: "instagramHandle",
    isRequired: false,
    description: "Instagram username/handle",
  },
  {
    csvColumn: "TMAC Playlist",
    schemaField: "playlistSong",
    isRequired: false,
    description: "Song suggestion for TMAC playlist",
  },
  {
    csvColumn: "Why Join",
    schemaField: "whyJoinTmac",
    isRequired: false,
    description: "Reason for joining TMAC",
  },
  {
    csvColumn: "Referral",
    schemaField: "referredBy",
    isRequired: false,
    description: "Who referred them to TMAC",
  },
];

/**
 * Column mappings that should be ignored/dropped
 */
export const IGNORED_COLUMNS = [
  "Timestamp",
  "Approved",
  "Active Games",
  "WhatsApp",
  "Do you Boulder?",
  "What is your highest V?",
  "Do you run?",
  "How my miles do you average a month?",
  "Are you okay with us celebrating your birthday in some way?",
  "Do you play Tennis?", // This should always be Yes for tennis profiles
  "", // Empty column headers
];

/**
 * Alternative column names that might appear in different CSV versions
 */
export const ALTERNATIVE_COLUMN_MAPPINGS: Record<string, string> = {
  // Email variations
  email: "email",
  Email: "email",
  "Email Address": "email",
  "email address": "email",

  // Phone variations
  phone: "phone",
  Phone: "phone",
  "Phone Number": "phone",
  "phone number": "phone",
  cell: "phone",
  mobile: "phone",

  // Gender variations
  gender: "gender",
  Gender: "gender",
  "Which most closely describes your gender?": "gender",

  // Age variations
  age: "ageRange",
  Age: "ageRange",
  "Age Range": "ageRange",
  "age range": "ageRange",

  // District variations
  district: "district",
  District: "district",
  "SF District": "district",
  location: "district",
  Location: "district",

  // Tennis ranking variations
  ranking: "tennisRanking",
  Ranking: "tennisRanking",
  "Tennis Ranking": "tennisRanking",
  "What is your Tennis Ranking?": "tennisRanking",
  NTRP: "tennisRanking",
  ntrp: "tennisRanking",

  // Instagram variations
  instagram: "instagramHandle",
  Instagram: "instagramHandle",
  insta: "instagramHandle",
  IG: "instagramHandle",
  ig: "instagramHandle",

  // Gear variations
  swag: "tmacGearPreference",
  Swag: "tmacGearPreference",
  gear: "tmacGearPreference",
  Gear: "tmacGearPreference",
  merchandise: "tmacGearPreference",
  merch: "tmacGearPreference",

  size: "gearSize",
  Size: "gearSize",
  "shirt size": "gearSize",
  "clothing size": "gearSize",
};

/**
 * Data transformation functions for specific fields
 */
export const FIELD_TRANSFORMERS = {
  email: (value: string) => {
    if (!value) return null;
    return value.toLowerCase().trim();
  },

  phone: (value: string) => {
    if (!value) return null;
    // Remove common phone formatting
    return value.replace(/[\s\-\(\)\.]/g, "").trim();
  },

  instagramHandle: (value: string) => {
    if (!value) return null;
    // Remove @ symbol if present, clean up handle
    return value
      .replace(/^@/, "")
      .replace(/https?:\/\/(?:www\.)?instagram\.com\//, "")
      .trim();
  },

  birthDate: (value: string) => {
    if (!value) return null;
    // Try to parse various date formats
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  },

  // Trim whitespace from text fields
  textField: (value: string) => {
    if (!value) return null;
    return value.trim() || null;
  },
};

/**
 * Get schema field name from CSV column name
 */
export function getSchemaFieldFromColumn(columnName: string): string | null {
  // First check direct mappings
  const directMapping = CSV_TO_SCHEMA_MAPPING.find(
    (m) => m.csvColumn === columnName
  );
  if (directMapping) {
    return directMapping.schemaField;
  }

  // Check alternative mappings
  const altMapping = ALTERNATIVE_COLUMN_MAPPINGS[columnName];
  if (altMapping) {
    return altMapping;
  }

  return null;
}

/**
 * Check if column should be ignored
 */
export function shouldIgnoreColumn(columnName: string): boolean {
  return IGNORED_COLUMNS.includes(columnName) || columnName.trim() === "";
}

/**
 * Get transformation function for a field
 */
export function getFieldTransformer(
  fieldName: string
): ((value: any) => any) | null {
  switch (fieldName) {
    case "email":
      return FIELD_TRANSFORMERS.email;
    case "phone":
      return FIELD_TRANSFORMERS.phone;
    case "instagramHandle":
      return FIELD_TRANSFORMERS.instagramHandle;
    case "birthDate":
      return FIELD_TRANSFORMERS.birthDate;
    case "playlistSong":
    case "whyJoinTmac":
    case "referredBy":
    case "favoriteTennisPlayer":
    case "districtOther":
    case "tmacGearOther":
      return FIELD_TRANSFORMERS.textField;
    default:
      return null;
  }
}

/**
 * CSV column analysis result
 */
export interface ColumnAnalysis {
  csvColumns: string[];
  mappedFields: Record<string, string>;
  ignoredColumns: string[];
  unmappedColumns: string[];
  missingRequiredFields: string[];
}

/**
 * Analyze CSV columns and determine mappings
 */
export function analyzeCsvColumns(csvColumns: string[]): ColumnAnalysis {
  const mappedFields: Record<string, string> = {};
  const ignoredColumns: string[] = [];
  const unmappedColumns: string[] = [];

  csvColumns.forEach((column) => {
    if (shouldIgnoreColumn(column)) {
      ignoredColumns.push(column);
    } else {
      const schemaField = getSchemaFieldFromColumn(column);
      if (schemaField) {
        mappedFields[column] = schemaField;
      } else {
        unmappedColumns.push(column);
      }
    }
  });

  // Check for missing required fields (email OR phone)
  const hasEmail = Object.values(mappedFields).includes("email");
  const hasPhone = Object.values(mappedFields).includes("phone");
  const missingRequiredFields: string[] = [];

  if (!hasEmail && !hasPhone) {
    missingRequiredFields.push("email or phone");
  }

  return {
    csvColumns,
    mappedFields,
    ignoredColumns,
    unmappedColumns,
    missingRequiredFields,
  };
}

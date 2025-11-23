import type { IntakeFormRow, ProcessedUserData } from "./types";
import {
  mapGender,
  mapDistrict,
  mapTennisRanking,
  mapAgeRange,
  mapEthnicity,
  mapGearPreference,
  mapGearSize,
} from "./enum-mappers";
import {
  cleanEmail,
  cleanPhone,
  cleanInstagramHandle,
  parseBirthDate,
  cleanText,
  cleanName,
  parseBoolean,
  parseTimestamp,
} from "./data-cleaners";

export function processIntakeFormRow(row: IntakeFormRow): ProcessedUserData {
  const processingNotes: string[] = [];

  // Clean and map basic fields
  const firstName = cleanName(row.firstName);
  const lastName = cleanName(row.lastName);

  // Use primary email, fallback to secondary
  const primaryEmail = cleanEmail(row.email);
  const secondaryEmail = cleanEmail(row.emailAddress);
  const email = primaryEmail || secondaryEmail;

  if (!email) {
    throw new Error("No valid email found");
  }

  const phone = cleanPhone(row.phone);
  const instagramHandle = cleanInstagramHandle(row.instagram);

  // Map enums
  const genderMapping = mapGender(row.genderDetailed || row.gender);
  const districtMapping = mapDistrict(row.district);
  const tennisRankingMapping = mapTennisRanking(row.tennisRanking);
  const ageRangeMapping = mapAgeRange(row.age);
  const ethnicityMapping = mapEthnicity(row.ethnicity);
  const gearPreferenceMapping = mapGearPreference(row.gearPreference);
  const gearSizeMapping = mapGearSize(row.gearSize);

  // Collect mapping notes
  [
    genderMapping,
    districtMapping,
    tennisRankingMapping,
    ageRangeMapping,
    ethnicityMapping,
    gearPreferenceMapping,
    gearSizeMapping,
  ].forEach(mapping => {
    if (mapping.confidence === "low" && mapping.notes) {
      processingNotes.push(mapping.notes);
    }
  });

  // Parse birth date
  const birthDate = parseBirthDate(row.birthDate);

  // Parse timestamp for createdAt
  const createdAt = parseTimestamp(row.timestamp);

  // Clean text fields with proper length limits from schema
  const playlistSong = cleanText(row.playlistSong, 10000);
  const whyJoinTmac = cleanText(row.whyJoin);
  const referredBy = cleanText(row.referredBy, 10000);
  const favoriteTennisPlayer = cleanText(row.favoriteTennisPlayer, 10000);

  // Handle district other
  let districtOther: string | null = null;
  if (districtMapping.value === "Other" && row.district) {
    districtOther = cleanText(row.district, 10000);
  }

  // Handle gear other
  let tmacGearOther: string | null = null;
  if (gearPreferenceMapping.value === "Other" && row.gearPreference) {
    tmacGearOther = cleanText(row.gearPreference, 10000);
  }

  return {
    // User fields (moved from tennisProfile)
    firstName,
    lastName,
    email,
    phone,
    emailVerified: false, // Default to false for imported users
    approved: parseBoolean(row.approved),
    createdAt,

    // TennisProfile fields
    gender: genderMapping.value,
    ageRange: ageRangeMapping.value,
    ethnicity: ethnicityMapping.value,
    birthDate,
    instagramHandle,
    district: districtMapping.value,
    districtOther,
    tmacGearPreference: gearPreferenceMapping.value,
    tmacGearOther,
    gearSize: gearSizeMapping.value,
    playlistSong,
    whyJoinTmac,
    referredBy,
    tennisRanking: tennisRankingMapping.value,
    favoriteTennisPlayer,

    // Metadata
    originalRow: row,
    processingNotes,
  };
}

export function validateProcessedData(data: ProcessedUserData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.email) {
    errors.push("Email is required");
  }

  if (!data.firstName) {
    errors.push("First name is required");
  }

  // Email format validation
  if (data.email && !data.email.includes("@")) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateProcessingReport(processedData: ProcessedUserData[]): {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  mappingIssues: { field: string; count: number }[];
  duplicateEmails: string[];
} {
  const validRecords = processedData.filter(
    data => validateProcessedData(data).isValid
  );
  const invalidRecords = processedData.filter(
    data => !validateProcessedData(data).isValid
  );

  // Count mapping issues
  const mappingIssues: { [key: string]: number } = {};
  processedData.forEach(data => {
    data.processingNotes.forEach(note => {
      mappingIssues[note] = (mappingIssues[note] || 0) + 1;
    });
  });

  // Find duplicate emails
  const emailCounts: { [email: string]: number } = {};
  processedData.forEach(data => {
    if (data.email) {
      emailCounts[data.email] = (emailCounts[data.email] || 0) + 1;
    }
  });

  const duplicateEmails = Object.keys(emailCounts).filter(
    email => emailCounts[email] > 1
  );

  return {
    totalRecords: processedData.length,
    validRecords: validRecords.length,
    invalidRecords: invalidRecords.length,
    mappingIssues: Object.entries(mappingIssues).map(([field, count]) => ({
      field,
      count,
    })),
    duplicateEmails,
  };
}

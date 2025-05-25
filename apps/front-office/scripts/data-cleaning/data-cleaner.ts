/**
 * Data Cleaning and Normalization
 *
 * This file handles the core data cleaning logic including enum mapping,
 * field normalization, and data transformation for TennisProfile records.
 */

import {
  ALL_ENUM_MAPPINGS,
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "./types";
import {
  normalizeEmail,
  normalizePhoneNumber,
  parseDate,
  cleanString,
  cleanInstagramHandle,
  detectAgeRange,
  generateId,
} from "./utils";
import { TENNIS_PROFILE_VALIDATION_RULES } from "./validation-rules";

/**
 * Data cleaning result for a single record
 */
export interface CleaningResult {
  success: boolean;
  cleanedRecord?: any;
  errors: string[];
  warnings: string[];
  transformations: string[];
}

/**
 * Clean and normalize a single tennis profile record
 */
export function cleanTennisProfileRecord(rawRecord: any): CleaningResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transformations: string[] = [];
  const cleanedRecord: any = {
    id: generateId(),
    userId: null, // Will be set during profile claiming
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Clean and validate email
    const emailResult = cleanEmail(rawRecord);
    if (emailResult.value) {
      cleanedRecord.email = emailResult.value;
      transformations.push(...emailResult.transformations);
    } else if (emailResult.errors.length > 0) {
      errors.push(...emailResult.errors);
    }

    // Clean and validate phone
    const phoneResult = cleanPhone(rawRecord);
    if (phoneResult.value) {
      cleanedRecord.phone = phoneResult.value;
      transformations.push(...phoneResult.transformations);
    } else if (phoneResult.errors.length > 0) {
      errors.push(...phoneResult.errors);
    }

    // Must have either email or phone
    if (!cleanedRecord.email && !cleanedRecord.phone) {
      errors.push("Record must have either valid email or phone number");
      return { success: false, errors, warnings, transformations };
    }

    // Clean demographic fields
    const genderResult = cleanGender(rawRecord);
    if (genderResult.value) {
      cleanedRecord.gender = genderResult.value;
      transformations.push(...genderResult.transformations);
    }
    warnings.push(...genderResult.warnings);

    const ageRangeResult = cleanAgeRange(rawRecord);
    if (ageRangeResult.value) {
      cleanedRecord.ageRange = ageRangeResult.value;
      transformations.push(...ageRangeResult.transformations);
    }
    warnings.push(...ageRangeResult.warnings);

    const ethnicityResult = cleanEthnicity(rawRecord);
    if (ethnicityResult.value) {
      cleanedRecord.ethnicity = ethnicityResult.value;
      transformations.push(...ethnicityResult.transformations);
    }
    warnings.push(...ethnicityResult.warnings);

    // Clean location fields
    const districtResult = cleanDistrict(rawRecord);
    if (districtResult.value) {
      cleanedRecord.district = districtResult.value;
      transformations.push(...districtResult.transformations);
    }
    warnings.push(...districtResult.warnings);

    // Clean TMAC preferences
    const gearResult = cleanTmacGear(rawRecord);
    if (gearResult.value) {
      cleanedRecord.tmacGearPreference = gearResult.value;
      transformations.push(...gearResult.transformations);
    }
    warnings.push(...gearResult.warnings);

    const sizeResult = cleanGearSize(rawRecord);
    if (sizeResult.value) {
      cleanedRecord.gearSize = sizeResult.value;
      transformations.push(...sizeResult.transformations);
    }
    warnings.push(...sizeResult.warnings);

    // Clean tennis-related fields
    const rankingResult = cleanTennisRanking(rawRecord);
    if (rankingResult.value) {
      cleanedRecord.tennisRanking = rankingResult.value;
      transformations.push(...rankingResult.transformations);
    }
    warnings.push(...rankingResult.warnings);

    // Clean text fields
    const textFields = [
      { field: "instagramHandle", maxLength: 50 },
      { field: "playlistSong", maxLength: 200 },
      { field: "whyJoinTmac", maxLength: 500 },
      { field: "referredBy", maxLength: 100 },
      { field: "favoriteTennisPlayer", maxLength: 100 },
      { field: "districtOther", maxLength: 100 },
      { field: "tmacGearOther", maxLength: 100 },
    ];

    textFields.forEach(({ field, maxLength }) => {
      const result = cleanTextField(rawRecord, field, maxLength);
      if (result.value) {
        cleanedRecord[field] = result.value;
        transformations.push(...result.transformations);
      }
      warnings.push(...result.warnings);
    });

    // Clean Instagram handle specifically
    if (rawRecord.instagramHandle || rawRecord.Instagram) {
      const instagramResult = cleanInstagramField(rawRecord);
      if (instagramResult.value) {
        cleanedRecord.instagramHandle = instagramResult.value;
        transformations.push(...instagramResult.transformations);
      }
      warnings.push(...instagramResult.warnings);
    }

    // Clean birth date
    const birthDateResult = cleanBirthDate(rawRecord);
    if (birthDateResult.value) {
      cleanedRecord.birthDate = birthDateResult.value;
      transformations.push(...birthDateResult.transformations);
    }
    warnings.push(...birthDateResult.warnings);

    return {
      success: true,
      cleanedRecord,
      errors,
      warnings,
      transformations,
    };
  } catch (error) {
    errors.push(`Unexpected error during cleaning: ${error}`);
    return { success: false, errors, warnings, transformations };
  }
}

/**
 * Clean email field
 */
function cleanEmail(record: any): {
  value: string | null;
  errors: string[];
  transformations: string[];
} {
  const errors: string[] = [];
  const transformations: string[] = [];

  const emailValue = record.email || record["Email"] || record["Email Address"];
  if (!emailValue) {
    return { value: null, errors, transformations };
  }

  const normalized = normalizeEmail(emailValue);
  if (normalized) {
    if (normalized !== emailValue) {
      transformations.push(
        `Email normalized: "${emailValue}" → "${normalized}"`
      );
    }
    return { value: normalized, errors, transformations };
  } else {
    errors.push(`Invalid email format: "${emailValue}"`);
    return { value: null, errors, transformations };
  }
}

/**
 * Clean phone field
 */
function cleanPhone(record: any): {
  value: string | null;
  errors: string[];
  transformations: string[];
} {
  const errors: string[] = [];
  const transformations: string[] = [];

  const phoneValue = record.phone || record["Phone Number"];
  if (!phoneValue) {
    return { value: null, errors, transformations };
  }

  const normalized = normalizePhoneNumber(phoneValue);
  if (normalized) {
    if (normalized !== phoneValue) {
      transformations.push(
        `Phone normalized: "${phoneValue}" → "${normalized}"`
      );
    }
    return { value: normalized, errors, transformations };
  } else {
    errors.push(`Invalid phone format: "${phoneValue}"`);
    return { value: null, errors, transformations };
  }
}

/**
 * Clean gender field
 */
function cleanGender(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const genderValue =
    record.gender || record["Which most closely describes your gender?"];
  if (!genderValue) {
    return { value: null, warnings, transformations };
  }

  const mapping = (ALL_ENUM_MAPPINGS.gender as any)[genderValue];
  if (mapping) {
    if (mapping !== genderValue) {
      transformations.push(`Gender mapped: "${genderValue}" → "${mapping}"`);
    }
    return { value: mapping, warnings, transformations };
  } else {
    warnings.push(`Could not map gender value: "${genderValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean age range field
 */
function cleanAgeRange(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const ageValue = record.ageRange || record.Age || record["Age"];
  if (!ageValue) {
    return { value: null, warnings, transformations };
  }

  // Try direct enum mapping first
  const directMapping = ALL_ENUM_MAPPINGS.ageRange[ageValue];
  if (directMapping) {
    if (directMapping !== ageValue) {
      transformations.push(
        `Age range mapped: "${ageValue}" → "${directMapping}"`
      );
    }
    return { value: directMapping, warnings, transformations };
  }

  // Try detecting from numeric age
  const detectedRange = detectAgeRange(ageValue);
  if (detectedRange) {
    transformations.push(
      `Age range detected from numeric age: "${ageValue}" → "${detectedRange}"`
    );
    return { value: detectedRange, warnings, transformations };
  }

  warnings.push(`Could not map age range value: "${ageValue}"`);
  return { value: null, warnings, transformations };
}

/**
 * Clean ethnicity field
 */
function cleanEthnicity(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const ethnicityValue = record.ethnicity || record["Ethnicity"];
  if (!ethnicityValue) {
    return { value: null, warnings, transformations };
  }

  const mapping = ALL_ENUM_MAPPINGS.ethnicity[ethnicityValue];
  if (mapping) {
    if (mapping !== ethnicityValue) {
      transformations.push(
        `Ethnicity mapped: "${ethnicityValue}" → "${mapping}"`
      );
    }
    return { value: mapping, warnings, transformations };
  } else {
    warnings.push(`Could not map ethnicity value: "${ethnicityValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean district field
 */
function cleanDistrict(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const districtValue = record.district || record["District"];
  if (!districtValue) {
    return { value: null, warnings, transformations };
  }

  const mapping = ALL_ENUM_MAPPINGS.district[districtValue];
  if (mapping) {
    if (mapping !== districtValue) {
      transformations.push(
        `District mapped: "${districtValue}" → "${mapping}"`
      );
    }
    return { value: mapping, warnings, transformations };
  } else {
    warnings.push(`Could not map district value: "${districtValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean TMAC gear preference
 */
function cleanTmacGear(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const gearValue = record.tmacGearPreference || record["Swag"];
  if (!gearValue) {
    return { value: null, warnings, transformations };
  }

  const mapping = ALL_ENUM_MAPPINGS.tmacGearPreference[gearValue];
  if (mapping) {
    if (mapping !== gearValue) {
      transformations.push(`TMAC gear mapped: "${gearValue}" → "${mapping}"`);
    }
    return { value: mapping, warnings, transformations };
  } else {
    warnings.push(`Could not map TMAC gear value: "${gearValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean gear size
 */
function cleanGearSize(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const sizeValue = record.gearSize || record["Size"];
  if (!sizeValue || sizeValue.trim() === "") {
    return { value: null, warnings, transformations };
  }

  // Direct enum value check
  if (Object.values(GearSize).includes(sizeValue as GearSize)) {
    return { value: sizeValue, warnings, transformations };
  } else {
    warnings.push(`Could not map gear size value: "${sizeValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean tennis ranking
 */
function cleanTennisRanking(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const rankingValue =
    record.tennisRanking || record["What is your Tennis Ranking?"];
  if (!rankingValue) {
    return { value: null, warnings, transformations };
  }

  const mapping = ALL_ENUM_MAPPINGS.tennisRanking[rankingValue];
  if (mapping) {
    if (mapping !== rankingValue) {
      transformations.push(
        `Tennis ranking mapped: "${rankingValue}" → "${mapping}"`
      );
    }
    return { value: mapping, warnings, transformations };
  } else {
    warnings.push(`Could not map tennis ranking value: "${rankingValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean text field with length validation
 */
function cleanTextField(
  record: any,
  fieldName: string,
  maxLength: number
): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const fieldValue = record[fieldName];
  if (!fieldValue) {
    return { value: null, warnings, transformations };
  }

  const cleaned = cleanString(fieldValue, maxLength);
  if (cleaned) {
    if (cleaned !== fieldValue) {
      transformations.push(
        `${fieldName} cleaned and truncated: "${fieldValue}" → "${cleaned}"`
      );
    }
    return { value: cleaned, warnings, transformations };
  }

  return { value: null, warnings, transformations };
}

/**
 * Clean Instagram handle specifically
 */
function cleanInstagramField(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const instagramValue = record.instagramHandle || record["Instagram"];
  if (!instagramValue) {
    return { value: null, warnings, transformations };
  }

  const cleaned = cleanInstagramHandle(instagramValue);
  if (cleaned) {
    if (cleaned !== instagramValue) {
      transformations.push(
        `Instagram handle cleaned: "${instagramValue}" → "${cleaned}"`
      );
    }
    return { value: cleaned, warnings, transformations };
  } else {
    warnings.push(`Could not clean Instagram handle: "${instagramValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Clean birth date field
 */
function cleanBirthDate(record: any): {
  value: string | null;
  warnings: string[];
  transformations: string[];
} {
  const warnings: string[] = [];
  const transformations: string[] = [];

  const birthDateValue = record.birthDate || record["Birth Date"];
  if (!birthDateValue) {
    return { value: null, warnings, transformations };
  }

  const parsed = parseDate(birthDateValue);
  if (parsed) {
    const isoString = parsed.toISOString().split("T")[0];
    if (isoString !== birthDateValue) {
      transformations.push(
        `Birth date formatted: "${birthDateValue}" → "${isoString}"`
      );
    }
    return { value: isoString, warnings, transformations };
  } else {
    warnings.push(`Could not parse birth date: "${birthDateValue}"`);
    return { value: null, warnings, transformations };
  }
}

/**
 * Batch clean multiple records
 */
export function cleanTennisProfileRecords(rawRecords: any[]): {
  cleanedRecords: any[];
  failedRecords: Array<{ record: any; index: number; errors: string[] }>;
  summary: {
    totalRecords: number;
    successfullyProcessed: number;
    failed: number;
    totalTransformations: number;
    totalWarnings: number;
  };
} {
  const cleanedRecords: any[] = [];
  const failedRecords: Array<{ record: any; index: number; errors: string[] }> =
    [];
  let totalTransformations = 0;
  let totalWarnings = 0;

  rawRecords.forEach((record, index) => {
    const result = cleanTennisProfileRecord(record);

    if (result.success && result.cleanedRecord) {
      cleanedRecords.push(result.cleanedRecord);
      totalTransformations += result.transformations.length;
      totalWarnings += result.warnings.length;
    } else {
      failedRecords.push({ record, index, errors: result.errors });
    }
  });

  return {
    cleanedRecords,
    failedRecords,
    summary: {
      totalRecords: rawRecords.length,
      successfullyProcessed: cleanedRecords.length,
      failed: failedRecords.length,
      totalTransformations,
      totalWarnings,
    },
  };
}

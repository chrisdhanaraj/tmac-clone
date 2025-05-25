/**
 * Duplicate Detection and Resolution
 *
 * This file handles detecting and resolving duplicate tennis profile records
 * based on email and phone number matching.
 */

import {
  normalizeEmail,
  normalizePhoneNumber,
  isSamePerson,
  isPartialMatch,
  createMatchingKey,
} from "./utils";

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  uniqueRecords: any[];
  duplicateGroups: DuplicateGroup[];
  partialMatches: PartialMatch[];
  summary: {
    totalInputRecords: number;
    uniqueRecords: number;
    duplicateGroups: number;
    totalDuplicates: number;
    partialMatches: number;
  };
}

/**
 * Group of duplicate records
 */
export interface DuplicateGroup {
  id: string;
  matchingKey: string;
  records: Array<{ record: any; originalIndex: number }>;
  matchType: "email" | "phone" | "both";
  resolvedRecord?: any;
  resolutionStrategy?: string;
}

/**
 * Partial match between records
 */
export interface PartialMatch {
  record1: { record: any; originalIndex: number };
  record2: { record: any; originalIndex: number };
  matchType: "email_only" | "phone_only";
  conflictingFields: string[];
}

/**
 * Detect duplicate records based on email and phone matching
 */
export function detectDuplicates(records: any[]): DuplicateDetectionResult {
  const emailGroups = new Map<
    string,
    Array<{ record: any; originalIndex: number }>
  >();
  const phoneGroups = new Map<
    string,
    Array<{ record: any; originalIndex: number }>
  >();
  const processedIndexes = new Set<number>();
  const duplicateGroups: DuplicateGroup[] = [];
  const partialMatches: PartialMatch[] = [];
  const uniqueRecords: any[] = [];

  // Group records by email and phone
  records.forEach((record, index) => {
    const email = normalizeEmail(record.email);
    const phone = normalizePhoneNumber(record.phone);

    if (email) {
      if (!emailGroups.has(email)) {
        emailGroups.set(email, []);
      }
      emailGroups.get(email)!.push({ record, originalIndex: index });
    }

    if (phone) {
      if (!phoneGroups.has(phone)) {
        phoneGroups.set(phone, []);
      }
      phoneGroups.get(phone)!.push({ record, originalIndex: index });
    }
  });

  // Find exact duplicates (same email AND phone, or same email OR phone with consistent data)
  const emailDuplicates = Array.from(emailGroups.entries()).filter(
    ([_, group]) => group.length > 1
  );
  const phoneDuplicates = Array.from(phoneGroups.entries()).filter(
    ([_, group]) => group.length > 1
  );

  // Process email duplicates
  emailDuplicates.forEach(([email, group]) => {
    const groupId = `email_${email}`;
    const duplicateGroup: DuplicateGroup = {
      id: groupId,
      matchingKey: email,
      records: group,
      matchType: "email",
    };

    // Check if all records in group are true duplicates
    const firstRecord = group[0].record;
    const allSame = group.every(({ record }) =>
      isSamePerson(firstRecord, record)
    );

    if (allSame) {
      duplicateGroups.push(duplicateGroup);
      group.forEach(({ originalIndex }) => processedIndexes.add(originalIndex));
    } else {
      // Check for partial matches
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const record1 = group[i];
          const record2 = group[j];

          if (isPartialMatch(record1.record, record2.record)) {
            partialMatches.push({
              record1,
              record2,
              matchType: "email_only",
              conflictingFields: findConflictingFields(
                record1.record,
                record2.record
              ),
            });
          }
        }
      }
    }
  });

  // Process phone duplicates (excluding already processed records)
  phoneDuplicates.forEach(([phone, group]) => {
    const unprocessedGroup = group.filter(
      ({ originalIndex }) => !processedIndexes.has(originalIndex)
    );

    if (unprocessedGroup.length > 1) {
      const groupId = `phone_${phone}`;
      const duplicateGroup: DuplicateGroup = {
        id: groupId,
        matchingKey: phone,
        records: unprocessedGroup,
        matchType: "phone",
      };

      // Check if all records in group are true duplicates
      const firstRecord = unprocessedGroup[0].record;
      const allSame = unprocessedGroup.every(({ record }) =>
        isSamePerson(firstRecord, record)
      );

      if (allSame) {
        duplicateGroups.push(duplicateGroup);
        unprocessedGroup.forEach(({ originalIndex }) =>
          processedIndexes.add(originalIndex)
        );
      } else {
        // Check for partial matches
        for (let i = 0; i < unprocessedGroup.length; i++) {
          for (let j = i + 1; j < unprocessedGroup.length; j++) {
            const record1 = unprocessedGroup[i];
            const record2 = unprocessedGroup[j];

            if (isPartialMatch(record1.record, record2.record)) {
              partialMatches.push({
                record1,
                record2,
                matchType: "phone_only",
                conflictingFields: findConflictingFields(
                  record1.record,
                  record2.record
                ),
              });
            }
          }
        }
      }
    }
  });

  // Add unique records (not in any duplicate group)
  records.forEach((record, index) => {
    if (!processedIndexes.has(index)) {
      uniqueRecords.push(record);
    }
  });

  return {
    uniqueRecords,
    duplicateGroups,
    partialMatches,
    summary: {
      totalInputRecords: records.length,
      uniqueRecords: uniqueRecords.length,
      duplicateGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce(
        (sum, group) => sum + group.records.length,
        0
      ),
      partialMatches: partialMatches.length,
    },
  };
}

/**
 * Find conflicting fields between two records
 */
function findConflictingFields(record1: any, record2: any): string[] {
  const conflicts: string[] = [];
  const fieldsToCheck = [
    "firstName",
    "lastName",
    "gender",
    "ageRange",
    "ethnicity",
    "district",
    "tennisRanking",
    "instagramHandle",
  ];

  fieldsToCheck.forEach((field) => {
    const value1 = record1[field];
    const value2 = record2[field];

    if (value1 && value2 && value1 !== value2) {
      conflicts.push(field);
    }
  });

  return conflicts;
}

/**
 * Resolve duplicate groups using various strategies
 */
export function resolveDuplicateGroups(
  duplicateGroups: DuplicateGroup[],
  strategy: "mostComplete" | "newest" | "oldest" | "manual" = "mostComplete"
): DuplicateGroup[] {
  return duplicateGroups.map((group) => {
    const resolvedGroup = { ...group };

    switch (strategy) {
      case "mostComplete":
        resolvedGroup.resolvedRecord = selectMostCompleteRecord(group.records);
        resolvedGroup.resolutionStrategy =
          "Selected record with most complete data";
        break;

      case "newest":
        resolvedGroup.resolvedRecord =
          group.records[group.records.length - 1].record;
        resolvedGroup.resolutionStrategy =
          "Selected most recently added record";
        break;

      case "oldest":
        resolvedGroup.resolvedRecord = group.records[0].record;
        resolvedGroup.resolutionStrategy = "Selected oldest record";
        break;

      case "manual":
        // Don't auto-resolve, requires manual intervention
        resolvedGroup.resolutionStrategy = "Requires manual resolution";
        break;
    }

    return resolvedGroup;
  });
}

/**
 * Select the most complete record from a group
 */
function selectMostCompleteRecord(
  recordGroup: Array<{ record: any; originalIndex: number }>
): any {
  let bestRecord = recordGroup[0].record;
  let bestScore = calculateCompletenessScore(bestRecord);

  recordGroup.forEach(({ record }) => {
    const score = calculateCompletenessScore(record);
    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
    }
  });

  return bestRecord;
}

/**
 * Calculate completeness score for a record
 */
function calculateCompletenessScore(record: any): number {
  const fields = [
    "email",
    "phone",
    "gender",
    "ageRange",
    "ethnicity",
    "birthDate",
    "district",
    "instagramHandle",
    "tennisRanking",
    "favoriteTennisPlayer",
    "tmacGearPreference",
    "gearSize",
    "playlistSong",
    "whyJoinTmac",
    "referredBy",
  ];

  let score = 0;
  fields.forEach((field) => {
    if (record[field] && record[field] !== "") {
      score += 1;
    }
  });

  // Bonus points for having both email and phone
  if (record.email && record.phone) {
    score += 2;
  }

  return score;
}

/**
 * Get records ready for import (unique + resolved duplicates)
 */
export function getCleanedRecords(
  detectionResult: DuplicateDetectionResult
): any[] {
  const cleanedRecords = [...detectionResult.uniqueRecords];

  // Add resolved duplicates
  detectionResult.duplicateGroups.forEach((group) => {
    if (group.resolvedRecord) {
      cleanedRecords.push(group.resolvedRecord);
    }
  });

  return cleanedRecords;
}

/**
 * Generate duplicate detection report
 */
export function generateDuplicateReport(result: DuplicateDetectionResult): {
  summary: string;
  duplicateGroups: string;
  partialMatches: string;
  recommendations: string[];
} {
  const { summary, duplicateGroups, partialMatches } = result;

  let summaryText = `# Duplicate Detection Report\n\n`;
  summaryText += `## Summary\n`;
  summaryText += `- Total input records: ${summary.totalInputRecords}\n`;
  summaryText += `- Unique records: ${summary.uniqueRecords}\n`;
  summaryText += `- Duplicate groups: ${summary.duplicateGroups}\n`;
  summaryText += `- Total duplicates: ${summary.totalDuplicates}\n`;
  summaryText += `- Partial matches: ${summary.partialMatches}\n\n`;

  let duplicateGroupsText = `## Duplicate Groups\n\n`;
  duplicateGroups.forEach((group, index) => {
    duplicateGroupsText += `### Group ${index + 1}: ${group.matchType} match (${
      group.matchingKey
    })\n`;
    duplicateGroupsText += `Records in group: ${group.records.length}\n`;
    if (group.resolutionStrategy) {
      duplicateGroupsText += `Resolution: ${group.resolutionStrategy}\n`;
    }
    duplicateGroupsText += `\n`;

    group.records.forEach((item, recordIndex) => {
      const { record, originalIndex } = item;
      duplicateGroupsText += `#### Record ${
        recordIndex + 1
      } (Original index: ${originalIndex})\n`;
      duplicateGroupsText += `- Email: ${record.email || "N/A"}\n`;
      duplicateGroupsText += `- Phone: ${record.phone || "N/A"}\n`;
      duplicateGroupsText += `- Name: ${record.firstName || ""} ${
        record.lastName || ""
      }\n`;
      duplicateGroupsText += `\n`;
    });
  });

  let partialMatchesText = `## Partial Matches\n\n`;
  if (partialMatches.length === 0) {
    partialMatchesText += `No partial matches found.\n`;
  } else {
    partialMatches.forEach((match, index) => {
      partialMatchesText += `### Partial Match ${index + 1}: ${
        match.matchType
      }\n`;
      partialMatchesText += `Conflicting fields: ${match.conflictingFields.join(
        ", "
      )}\n`;
      partialMatchesText += `\n`;
      partialMatchesText += `Record 1 (Index ${match.record1.originalIndex}):\n`;
      partialMatchesText += `- Email: ${match.record1.record.email || "N/A"}\n`;
      partialMatchesText += `- Phone: ${match.record1.record.phone || "N/A"}\n`;
      partialMatchesText += `\n`;
      partialMatchesText += `Record 2 (Index ${match.record2.originalIndex}):\n`;
      partialMatchesText += `- Email: ${match.record2.record.email || "N/A"}\n`;
      partialMatchesText += `- Phone: ${match.record2.record.phone || "N/A"}\n`;
      partialMatchesText += `\n`;
    });
  }

  const recommendations: string[] = [];

  if (summary.duplicateGroups > 0) {
    recommendations.push(
      "Review duplicate groups and confirm resolution strategy"
    );
  }

  if (summary.partialMatches > 0) {
    recommendations.push(
      "Manually review partial matches - these may be data quality issues"
    );
  }

  if (summary.totalDuplicates > summary.totalInputRecords * 0.1) {
    recommendations.push(
      "High duplicate rate detected - consider data source quality review"
    );
  }

  return {
    summary: summaryText,
    duplicateGroups: duplicateGroupsText,
    partialMatches: partialMatchesText,
    recommendations,
  };
}

/**
 * Flag problematic duplicates that need manual review
 */
export function flagProblematicDuplicates(
  duplicateGroups: DuplicateGroup[],
  partialMatches: PartialMatch[]
): Array<{ type: "duplicate" | "partial"; issue: string; records: any[] }> {
  const problematic: Array<{
    type: "duplicate" | "partial";
    issue: string;
    records: any[];
  }> = [];

  // Flag duplicate groups with significant conflicts
  duplicateGroups.forEach((group) => {
    if (group.records.length > 2) {
      problematic.push({
        type: "duplicate",
        issue: `Large duplicate group (${group.records.length} records) - verify all belong to same person`,
        records: group.records.map((r) => r.record),
      });
    }

    // Check for conflicting data within group
    const conflicts = findGroupConflicts(group.records.map((r) => r.record));
    if (conflicts.length > 0) {
      problematic.push({
        type: "duplicate",
        issue: `Conflicting data in duplicate group: ${conflicts.join(", ")}`,
        records: group.records.map((r) => r.record),
      });
    }
  });

  // Flag all partial matches as problematic
  partialMatches.forEach((match) => {
    problematic.push({
      type: "partial",
      issue: `Partial match with conflicting ${match.conflictingFields.join(
        ", "
      )}`,
      records: [match.record1.record, match.record2.record],
    });
  });

  return problematic;
}

/**
 * Find conflicts within a group of records
 */
function findGroupConflicts(records: any[]): string[] {
  if (records.length < 2) return [];

  const conflicts: string[] = [];
  const fieldsToCheck = [
    "firstName",
    "lastName",
    "gender",
    "ageRange",
    "district",
  ];

  fieldsToCheck.forEach((field) => {
    const values = records
      .map((r) => r[field])
      .filter((v) => v && v !== "")
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique values

    if (values.length > 1) {
      conflicts.push(field);
    }
  });

  return conflicts;
}

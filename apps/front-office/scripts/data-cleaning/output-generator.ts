/**
 * Output Generation
 *
 * This file handles generating the final cleaned CSV file and comprehensive
 * JSON validation report for the AI agent data cleaning process.
 */

import {
  DuplicateDetectionResult,
  generateDuplicateReport,
} from "./duplicate-detector";
import {
  CsvProcessingResult,
  generateColumnMappingReport,
} from "./csv-processor";

/**
 * Complete validation report structure
 */
export interface ValidationReport {
  metadata: {
    processedAt: string;
    version: string;
    inputFile: string;
    totalInputRecords: number;
    totalOutputRecords: number;
    processingTimeMs: number;
  };
  columnMapping: {
    mappedColumns: Record<string, string>;
    ignoredColumns: string[];
    unmappedColumns: string[];
    missingRequiredFields: string[];
  };
  dataQuality: {
    validRecords: number;
    invalidRecords: number;
    recordsWithEmail: number;
    recordsWithPhone: number;
    recordsWithBoth: number;
    recordsWithNeither: number;
  };
  duplicateAnalysis: {
    uniqueRecords: number;
    duplicateGroups: number;
    totalDuplicates: number;
    partialMatches: number;
    resolvedDuplicates: number;
  };
  transformations: {
    totalTransformations: number;
    transformationTypes: Record<string, number>;
    sampleTransformations: string[];
  };
  validation: {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  };
  recommendations: string[];
  problematicRecords: ProblematicRecord[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  recordIndex: number;
  field: string;
  value: any;
  error: string;
  severity: "error" | "critical";
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  recordIndex: number;
  field: string;
  value: any;
  warning: string;
  suggestion?: string;
}

/**
 * Problematic record that needs manual review
 */
export interface ProblematicRecord {
  recordIndex: number;
  record: any;
  issues: string[];
  type: "duplicate" | "partial_match" | "data_quality" | "validation_error";
}

/**
 * Generate cleaned CSV file content
 */
export function generateCleanedCsv(cleanedRecords: any[]): string {
  if (cleanedRecords.length === 0) {
    return "";
  }

  // Define the output column order for TennisProfile
  const outputColumns = [
    "id",
    "userId",
    "email",
    "phone",
    "gender",
    "ageRange",
    "ethnicity",
    "birthDate",
    "instagramHandle",
    "district",
    "districtOther",
    "tmacGearPreference",
    "tmacGearOther",
    "gearSize",
    "playlistSong",
    "whyJoinTmac",
    "referredBy",
    "tennisRanking",
    "favoriteTennisPlayer",
    "createdAt",
    "updatedAt",
    "lastReminderAt",
  ];

  // Generate CSV header
  const csvLines = [outputColumns.map((col) => `"${col}"`).join(",")];

  // Generate CSV rows
  cleanedRecords.forEach((record) => {
    const row = outputColumns.map((column) => {
      const value = record[column];
      if (value === null || value === undefined) {
        return "";
      }

      // Escape quotes and wrap in quotes if necessary
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });

    csvLines.push(row.join(","));
  });

  return csvLines.join("\n");
}

/**
 * Generate comprehensive validation report
 */
export function generateValidationReport(
  inputFileName: string,
  csvResult: CsvProcessingResult,
  duplicateResult: DuplicateDetectionResult,
  cleanedRecords: any[],
  processingTimeMs: number,
  transformations: string[] = [],
  allWarnings: ValidationWarning[] = [],
  allErrors: ValidationError[] = []
): ValidationReport {
  const now = new Date().toISOString();

  // Analyze transformations
  const transformationTypes: Record<string, number> = {};
  transformations.forEach((transformation) => {
    const type = transformation.split(":")[0].trim();
    transformationTypes[type] = (transformationTypes[type] || 0) + 1;
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (duplicateResult.summary.duplicateGroups > 0) {
    recommendations.push(
      "Review and verify duplicate resolution before importing"
    );
  }

  if (duplicateResult.summary.partialMatches > 0) {
    recommendations.push(
      "Manually review partial matches - they may indicate data quality issues"
    );
  }

  if (csvResult.invalidRows.length > 0) {
    recommendations.push(
      `${csvResult.invalidRows.length} records failed validation and were excluded`
    );
  }

  if (csvResult.columnAnalysis.unmappedColumns.length > 0) {
    recommendations.push(
      "Verify that unmapped columns should be dropped from the output"
    );
  }

  const errorRate = (allErrors.length / csvResult.totalRows) * 100;
  if (errorRate > 10) {
    recommendations.push(
      "High error rate detected - consider reviewing data source quality"
    );
  }

  // Generate problematic records list
  const problematicRecords: ProblematicRecord[] = [];

  // Add validation errors as problematic
  csvResult.invalidRows.forEach((invalidRow, index) => {
    problematicRecords.push({
      recordIndex: invalidRow.index,
      record: invalidRow.row,
      issues: invalidRow.errors,
      type: "validation_error",
    });
  });

  // Add duplicate groups as problematic
  duplicateResult.duplicateGroups.forEach((group) => {
    group.records.forEach(({ record, originalIndex }) => {
      problematicRecords.push({
        recordIndex: originalIndex,
        record,
        issues: [
          `Part of duplicate group: ${group.matchType} match on ${group.matchingKey}`,
        ],
        type: "duplicate",
      });
    });
  });

  // Add partial matches as problematic
  duplicateResult.partialMatches.forEach((match) => {
    problematicRecords.push({
      recordIndex: match.record1.originalIndex,
      record: match.record1.record,
      issues: [
        `Partial match with record ${
          match.record2.originalIndex
        }: ${match.conflictingFields.join(", ")}`,
      ],
      type: "partial_match",
    });

    problematicRecords.push({
      recordIndex: match.record2.originalIndex,
      record: match.record2.record,
      issues: [
        `Partial match with record ${
          match.record1.originalIndex
        }: ${match.conflictingFields.join(", ")}`,
      ],
      type: "partial_match",
    });
  });

  return {
    metadata: {
      processedAt: now,
      version: "1.0.0",
      inputFile: inputFileName,
      totalInputRecords: csvResult.totalRows,
      totalOutputRecords: cleanedRecords.length,
      processingTimeMs,
    },
    columnMapping: {
      mappedColumns: csvResult.columnAnalysis.mappedFields,
      ignoredColumns: csvResult.columnAnalysis.ignoredColumns,
      unmappedColumns: csvResult.columnAnalysis.unmappedColumns,
      missingRequiredFields: csvResult.columnAnalysis.missingRequiredFields,
    },
    dataQuality: {
      validRecords: csvResult.validRows.length,
      invalidRecords: csvResult.invalidRows.length,
      recordsWithEmail: csvResult.processingStats.recordsWithEmail,
      recordsWithPhone: csvResult.processingStats.recordsWithPhone,
      recordsWithBoth: csvResult.processingStats.recordsWithBoth,
      recordsWithNeither: csvResult.processingStats.recordsWithNeither,
    },
    duplicateAnalysis: {
      uniqueRecords: duplicateResult.summary.uniqueRecords,
      duplicateGroups: duplicateResult.summary.duplicateGroups,
      totalDuplicates: duplicateResult.summary.totalDuplicates,
      partialMatches: duplicateResult.summary.partialMatches,
      resolvedDuplicates: duplicateResult.duplicateGroups.filter(
        (g) => g.resolvedRecord
      ).length,
    },
    transformations: {
      totalTransformations: transformations.length,
      transformationTypes,
      sampleTransformations: transformations.slice(0, 20), // First 20 as samples
    },
    validation: {
      errors: allErrors,
      warnings: allWarnings,
    },
    recommendations,
    problematicRecords,
  };
}

/**
 * Generate human-readable summary report
 */
export function generateSummaryReport(
  validationReport: ValidationReport
): string {
  const {
    metadata,
    dataQuality,
    duplicateAnalysis,
    transformations,
    validation,
  } = validationReport;

  let report = `# Data Cleaning Summary Report\n\n`;

  // Metadata section
  report += `## Processing Summary\n`;
  report += `- **Processed at:** ${metadata.processedAt}\n`;
  report += `- **Input file:** ${metadata.inputFile}\n`;
  report += `- **Input records:** ${metadata.totalInputRecords}\n`;
  report += `- **Output records:** ${metadata.totalOutputRecords}\n`;
  report += `- **Processing time:** ${metadata.processingTimeMs}ms\n`;
  report += `- **Success rate:** ${(
    (metadata.totalOutputRecords / metadata.totalInputRecords) *
    100
  ).toFixed(1)}%\n\n`;

  // Data quality section
  report += `## Data Quality Analysis\n`;
  report += `- **Valid records:** ${dataQuality.validRecords}\n`;
  report += `- **Invalid records:** ${dataQuality.invalidRecords}\n`;
  report += `- **Records with email:** ${dataQuality.recordsWithEmail}\n`;
  report += `- **Records with phone:** ${dataQuality.recordsWithPhone}\n`;
  report += `- **Records with both:** ${dataQuality.recordsWithBoth}\n`;
  report += `- **Records with neither:** ${dataQuality.recordsWithNeither}\n\n`;

  // Duplicate analysis section
  report += `## Duplicate Analysis\n`;
  report += `- **Unique records:** ${duplicateAnalysis.uniqueRecords}\n`;
  report += `- **Duplicate groups:** ${duplicateAnalysis.duplicateGroups}\n`;
  report += `- **Total duplicates:** ${duplicateAnalysis.totalDuplicates}\n`;
  report += `- **Partial matches:** ${duplicateAnalysis.partialMatches}\n`;
  report += `- **Resolved duplicates:** ${duplicateAnalysis.resolvedDuplicates}\n\n`;

  // Transformations section
  report += `## Data Transformations\n`;
  report += `- **Total transformations:** ${transformations.totalTransformations}\n`;
  if (Object.keys(transformations.transformationTypes).length > 0) {
    report += `- **Transformation types:**\n`;
    Object.entries(transformations.transformationTypes).forEach(
      ([type, count]) => {
        report += `  - ${type}: ${count}\n`;
      }
    );
  }
  report += `\n`;

  // Validation issues section
  report += `## Validation Issues\n`;
  report += `- **Errors:** ${validation.errors.length}\n`;
  report += `- **Warnings:** ${validation.warnings.length}\n\n`;

  // Recommendations section
  if (validationReport.recommendations.length > 0) {
    report += `## Recommendations\n`;
    validationReport.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  }

  // Column mapping section
  report += `## Column Mapping\n`;
  report += `- **Mapped columns:** ${
    Object.keys(validationReport.columnMapping.mappedColumns).length
  }\n`;
  report += `- **Ignored columns:** ${validationReport.columnMapping.ignoredColumns.length}\n`;
  report += `- **Unmapped columns:** ${validationReport.columnMapping.unmappedColumns.length}\n\n`;

  if (validationReport.columnMapping.unmappedColumns.length > 0) {
    report += `### Unmapped Columns (will be dropped):\n`;
    validationReport.columnMapping.unmappedColumns.forEach((col) => {
      report += `- "${col}"\n`;
    });
    report += `\n`;
  }

  return report;
}

/**
 * Generate detailed error report
 */
export function generateErrorReport(
  validationReport: ValidationReport
): string {
  let report = `# Data Cleaning Error Report\n\n`;

  const { validation, problematicRecords } = validationReport;

  if (validation.errors.length === 0 && problematicRecords.length === 0) {
    report += `No errors or problematic records found.\n`;
    return report;
  }

  // Validation errors
  if (validation.errors.length > 0) {
    report += `## Validation Errors (${validation.errors.length})\n\n`;
    validation.errors.forEach((error, index) => {
      report += `### Error ${index + 1}\n`;
      report += `- **Record Index:** ${error.recordIndex}\n`;
      report += `- **Field:** ${error.field}\n`;
      report += `- **Value:** ${JSON.stringify(error.value)}\n`;
      report += `- **Error:** ${error.error}\n`;
      report += `- **Severity:** ${error.severity}\n\n`;
    });
  }

  // Problematic records by type
  const recordsByType = problematicRecords.reduce((acc, record) => {
    if (!acc[record.type]) {
      acc[record.type] = [];
    }
    acc[record.type].push(record);
    return acc;
  }, {} as Record<string, ProblematicRecord[]>);

  Object.entries(recordsByType).forEach(([type, records]) => {
    report += `## ${type.replace(/_/g, " ").toUpperCase()} Records (${
      records.length
    })\n\n`;

    records.forEach((record, index) => {
      report += `### Record ${index + 1} (Index: ${record.recordIndex})\n`;
      report += `**Issues:**\n`;
      record.issues.forEach((issue) => {
        report += `- ${issue}\n`;
      });

      // Show key fields from the record
      const keyFields = ["email", "phone", "firstName", "lastName"];
      report += `\n**Key Fields:**\n`;
      keyFields.forEach((field) => {
        if (record.record[field]) {
          report += `- ${field}: ${record.record[field]}\n`;
        }
      });
      report += `\n`;
    });
  });

  return report;
}

/**
 * Save files to filesystem (in a real implementation)
 */
export interface OutputFiles {
  cleanedCsv: string;
  validationReportJson: string;
  summaryReportMd: string;
  errorReportMd: string;
  columnMappingMd: string;
}

/**
 * Generate all output files
 */
export function generateAllOutputs(
  inputFileName: string,
  csvResult: CsvProcessingResult,
  duplicateResult: DuplicateDetectionResult,
  cleanedRecords: any[],
  processingTimeMs: number,
  transformations: string[] = [],
  allWarnings: ValidationWarning[] = [],
  allErrors: ValidationError[] = []
): OutputFiles {
  // Generate validation report
  const validationReport = generateValidationReport(
    inputFileName,
    csvResult,
    duplicateResult,
    cleanedRecords,
    processingTimeMs,
    transformations,
    allWarnings,
    allErrors
  );

  return {
    cleanedCsv: generateCleanedCsv(cleanedRecords),
    validationReportJson: JSON.stringify(validationReport, null, 2),
    summaryReportMd: generateSummaryReport(validationReport),
    errorReportMd: generateErrorReport(validationReport),
    columnMappingMd: generateColumnMappingReport(csvResult.columnAnalysis),
  };
}

/**
 * Calculate processing statistics
 */
export function calculateProcessingStats(
  inputRecords: number,
  outputRecords: number,
  errors: number,
  warnings: number,
  transformations: number
): {
  successRate: number;
  errorRate: number;
  warningRate: number;
  transformationRate: number;
  dataLossRate: number;
} {
  return {
    successRate: (outputRecords / inputRecords) * 100,
    errorRate: (errors / inputRecords) * 100,
    warningRate: (warnings / inputRecords) * 100,
    transformationRate: (transformations / inputRecords) * 100,
    dataLossRate: ((inputRecords - outputRecords) / inputRecords) * 100,
  };
}

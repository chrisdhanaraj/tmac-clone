/**
 * CSV Processing and Validation
 *
 * This file handles reading, parsing, and initial validation of CSV roster data
 * for the TennisProfile data cleaning process.
 */

import {
  analyzeCsvColumns,
  getSchemaFieldFromColumn,
  shouldIgnoreColumn,
} from "./csv-mapping";
import { validateRecord, normalizeEmail, normalizePhoneNumber } from "./utils";

/**
 * CSV Processing Result Interface
 */
export interface CsvProcessingResult {
  totalRows: number;
  validRows: any[];
  invalidRows: Array<{ row: any; index: number; errors: string[] }>;
  columnAnalysis: {
    csvColumns: string[];
    mappedFields: Record<string, string>;
    ignoredColumns: string[];
    unmappedColumns: string[];
    missingRequiredFields: string[];
  };
  processingStats: {
    recordsWithEmail: number;
    recordsWithPhone: number;
    recordsWithBoth: number;
    recordsWithNeither: number;
    duplicateEmails: number;
    duplicatePhones: number;
  };
}

/**
 * Parse CSV string into array of objects
 */
export function parseCsvString(csvContent: string): any[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header row
  const headers = parseCsvLine(lines[0]);
  const records: any[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);

    if (values.length === 0) continue; // Skip empty rows

    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });

    records.push(record);
  }

  return records;
}

/**
 * Parse a single CSV line, handling quoted values and commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Process CSV data and perform initial validation
 */
export function processCsvData(csvContent: string): CsvProcessingResult {
  // Parse CSV
  const rawRecords = parseCsvString(csvContent);

  if (rawRecords.length === 0) {
    throw new Error("No data records found in CSV");
  }

  // Analyze columns
  const firstRecord = rawRecords[0];
  const csvColumns = Object.keys(firstRecord);
  const columnAnalysis = analyzeCsvColumns(csvColumns);

  // Process each record
  const validRows: any[] = [];
  const invalidRows: Array<{ row: any; index: number; errors: string[] }> = [];

  const emailSet = new Set<string>();
  const phoneSet = new Set<string>();
  let recordsWithEmail = 0;
  let recordsWithPhone = 0;
  let recordsWithBoth = 0;
  let recordsWithNeither = 0;
  let duplicateEmails = 0;
  let duplicatePhones = 0;

  rawRecords.forEach((record, index) => {
    const errors: string[] = [];
    const processedRecord: any = {};

    // Map CSV columns to schema fields
    Object.keys(record).forEach((csvColumn) => {
      if (shouldIgnoreColumn(csvColumn)) {
        return; // Skip ignored columns
      }

      const schemaField = getSchemaFieldFromColumn(csvColumn);
      if (schemaField) {
        processedRecord[schemaField] = record[csvColumn];
      } else {
        // Log unmapped column but don't error
        processedRecord[`_unmapped_${csvColumn}`] = record[csvColumn];
      }
    });

    // Validate email and phone
    const email = normalizeEmail(processedRecord.email);
    const phone = normalizePhoneNumber(processedRecord.phone);

    if (email) {
      processedRecord.email = email;
      recordsWithEmail++;

      if (emailSet.has(email)) {
        duplicateEmails++;
        errors.push(`Duplicate email: ${email}`);
      } else {
        emailSet.add(email);
      }
    }

    if (phone) {
      processedRecord.phone = phone;
      recordsWithPhone++;

      if (phoneSet.has(phone)) {
        duplicatePhones++;
        errors.push(`Duplicate phone: ${phone}`);
      } else {
        phoneSet.add(phone);
      }
    }

    // Check matching requirements
    if (email && phone) {
      recordsWithBoth++;
    } else if (!email && !phone) {
      recordsWithNeither++;
      errors.push("Record has neither valid email nor phone number");
    }

    // Additional validation
    const validation = validateRecord(processedRecord);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    if (errors.length > 0) {
      invalidRows.push({ row: processedRecord, index, errors });
    } else {
      validRows.push(processedRecord);
    }
  });

  return {
    totalRows: rawRecords.length,
    validRows,
    invalidRows,
    columnAnalysis,
    processingStats: {
      recordsWithEmail,
      recordsWithPhone,
      recordsWithBoth,
      recordsWithNeither,
      duplicateEmails,
      duplicatePhones,
    },
  };
}

/**
 * Analyze data quality issues
 */
export function analyzeDataQuality(result: CsvProcessingResult): {
  issues: string[];
  warnings: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const { columnAnalysis, processingStats, totalRows, invalidRows } = result;

  // Column analysis issues
  if (columnAnalysis.missingRequiredFields.length > 0) {
    issues.push(
      `Missing required fields: ${columnAnalysis.missingRequiredFields.join(
        ", "
      )}`
    );
  }

  if (columnAnalysis.unmappedColumns.length > 0) {
    warnings.push(
      `Unmapped columns will be dropped: ${columnAnalysis.unmappedColumns.join(
        ", "
      )}`
    );
  }

  // Data quality issues
  const invalidPercentage = (invalidRows.length / totalRows) * 100;
  if (invalidPercentage > 10) {
    issues.push(
      `High invalid record rate: ${invalidPercentage.toFixed(1)}% (${
        invalidRows.length
      }/${totalRows})`
    );
  } else if (invalidPercentage > 5) {
    warnings.push(
      `Moderate invalid record rate: ${invalidPercentage.toFixed(1)}% (${
        invalidRows.length
      }/${totalRows})`
    );
  }

  // Duplicate issues
  if (processingStats.duplicateEmails > 0) {
    issues.push(
      `Found ${processingStats.duplicateEmails} duplicate email addresses`
    );
  }

  if (processingStats.duplicatePhones > 0) {
    issues.push(
      `Found ${processingStats.duplicatePhones} duplicate phone numbers`
    );
  }

  // Missing contact info
  if (processingStats.recordsWithNeither > 0) {
    issues.push(
      `${processingStats.recordsWithNeither} records have no email or phone number`
    );
  }

  const noEmailPercentage =
    ((totalRows - processingStats.recordsWithEmail) / totalRows) * 100;
  const noPhonePercentage =
    ((totalRows - processingStats.recordsWithPhone) / totalRows) * 100;

  if (noEmailPercentage > 20) {
    warnings.push(
      `${noEmailPercentage.toFixed(1)}% of records missing email addresses`
    );
  }

  if (noPhonePercentage > 20) {
    warnings.push(
      `${noPhonePercentage.toFixed(1)}% of records missing phone numbers`
    );
  }

  // Recommendations
  if (
    processingStats.duplicateEmails > 0 ||
    processingStats.duplicatePhones > 0
  ) {
    recommendations.push(
      "Review and resolve duplicate records before proceeding"
    );
  }

  if (columnAnalysis.unmappedColumns.length > 0) {
    recommendations.push("Verify that unmapped columns should be dropped");
  }

  if (invalidRows.length > 0) {
    recommendations.push("Review invalid records and fix data quality issues");
  }

  return { issues, warnings, recommendations };
}

/**
 * Generate detailed column mapping report
 */
export function generateColumnMappingReport(columnAnalysis: any): string {
  let report = "# CSV Column Mapping Report\n\n";

  report += "## Mapped Columns\n";
  Object.entries(columnAnalysis.mappedFields).forEach(
    ([csvCol, schemaField]) => {
      report += `- "${csvCol}" → ${schemaField}\n`;
    }
  );

  if (columnAnalysis.ignoredColumns.length > 0) {
    report += "\n## Ignored Columns\n";
    columnAnalysis.ignoredColumns.forEach((col: string) => {
      report += `- "${col}" (intentionally ignored)\n`;
    });
  }

  if (columnAnalysis.unmappedColumns.length > 0) {
    report += "\n## Unmapped Columns (will be dropped)\n";
    columnAnalysis.unmappedColumns.forEach((col: string) => {
      report += `- "${col}"\n`;
    });
  }

  if (columnAnalysis.missingRequiredFields.length > 0) {
    report += "\n## Missing Required Fields\n";
    columnAnalysis.missingRequiredFields.forEach((field: string) => {
      report += `- ${field}\n`;
    });
  }

  return report;
}

/**
 * Flag records missing critical data
 */
export function flagCriticalDataIssues(records: any[]): Array<{
  index: number;
  record: any;
  issues: string[];
}> {
  const flaggedRecords: Array<{
    index: number;
    record: any;
    issues: string[];
  }> = [];

  records.forEach((record, index) => {
    const issues: string[] = [];

    const hasEmail = record.email && normalizeEmail(record.email);
    const hasPhone = record.phone && normalizePhoneNumber(record.phone);

    if (!hasEmail && !hasPhone) {
      issues.push("No valid email or phone number for matching");
    }

    if (!hasEmail) {
      issues.push("Missing email address");
    }

    if (!hasPhone) {
      issues.push("Missing phone number");
    }

    if (issues.length > 0) {
      flaggedRecords.push({ index, record, issues });
    }
  });

  return flaggedRecords;
}

/**
 * Main Data Cleaning Orchestrator
 *
 * This script orchestrates the complete data cleaning process for tennis roster data.
 * It processes the CSV file through all cleaning stages and generates outputs.
 */

import * as fs from "fs";
import * as path from "path";
import { processCsvData, analyzeDataQuality } from "./csv-processor";
import { cleanTennisProfileRecords } from "./data-cleaner";
import {
  detectDuplicates,
  resolveDuplicateGroups,
  getCleanedRecords,
} from "./duplicate-detector";
import { generateAllOutputs } from "./output-generator";
import type { ValidationWarning, ValidationError } from "./output-generator";

/**
 * Main data cleaning function
 */
export async function cleanRosterData(
  csvFilePath: string,
  outputDir: string = "./output"
): Promise<{
  success: boolean;
  message: string;
  stats: any;
  outputFiles: string[];
}> {
  const startTime = Date.now();
  console.log("🚀 Starting roster data cleaning process...");

  try {
    // Step 1: Read CSV file
    console.log("📄 Reading CSV file...");
    const csvContent = fs.readFileSync(csvFilePath, "utf-8");
    const fileName = path.basename(csvFilePath);

    // Step 2: Process CSV data
    console.log("🔍 Processing and validating CSV data...");
    const csvResult = processCsvData(csvContent);
    console.log(`   ✅ Processed ${csvResult.totalRows} records`);
    console.log(
      `   ✅ Valid: ${csvResult.validRows.length}, Invalid: ${csvResult.invalidRows.length}`
    );

    // Step 3: Analyze data quality
    const dataQuality = analyzeDataQuality(csvResult);
    console.log("📊 Data quality analysis:");
    dataQuality.issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
    dataQuality.warnings.forEach((warning) => console.log(`   ⚡ ${warning}`));

    // Step 4: Clean the valid records
    console.log("🧹 Cleaning and normalizing data...");
    const cleaningResult = cleanTennisProfileRecords(csvResult.validRows);
    console.log(
      `   ✅ Successfully cleaned: ${cleaningResult.cleanedRecords.length}`
    );
    console.log(
      `   ❌ Failed to clean: ${cleaningResult.failedRecords.length}`
    );
    console.log(
      `   🔄 Total transformations: ${cleaningResult.summary.totalTransformations}`
    );

    // Step 5: Detect and resolve duplicates
    console.log("🔍 Detecting duplicates...");
    const duplicateResult = detectDuplicates(cleaningResult.cleanedRecords);
    console.log(
      `   ✅ Unique records: ${duplicateResult.summary.uniqueRecords}`
    );
    console.log(
      `   👥 Duplicate groups: ${duplicateResult.summary.duplicateGroups}`
    );
    console.log(
      `   ⚠️  Partial matches: ${duplicateResult.summary.partialMatches}`
    );

    // Step 6: Resolve duplicates
    console.log("🔧 Resolving duplicates...");
    const resolvedGroups = resolveDuplicateGroups(
      duplicateResult.duplicateGroups,
      "mostComplete"
    );
    const finalCleanedRecords = getCleanedRecords({
      ...duplicateResult,
      duplicateGroups: resolvedGroups,
    });
    console.log(`   ✅ Final cleaned records: ${finalCleanedRecords.length}`);

    // Step 7: Generate outputs
    console.log("📁 Generating output files...");
    const processingTime = Date.now() - startTime;

    // Collect all transformations and errors
    const allTransformations: string[] = [];
    const allWarnings: ValidationWarning[] = [];
    const allErrors: ValidationError[] = [];

    // Add cleaning transformations
    cleaningResult.cleanedRecords.forEach((_, index) => {
      // This would normally come from the cleaning process
      // For now, we'll use a placeholder
    });

    // Add invalid record errors
    csvResult.invalidRows.forEach((invalidRow) => {
      invalidRow.errors.forEach((error) => {
        allErrors.push({
          recordIndex: invalidRow.index,
          field: "general",
          value: invalidRow.row,
          error: error,
          severity: "error",
        });
      });
    });

    const outputs = generateAllOutputs(
      fileName,
      csvResult,
      { ...duplicateResult, duplicateGroups: resolvedGroups },
      finalCleanedRecords,
      processingTime,
      allTransformations,
      allWarnings,
      allErrors
    );

    // Step 8: Write output files
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFiles: string[] = [];

    // Write cleaned CSV
    const cleanedCsvPath = path.join(outputDir, "cleaned_roster.csv");
    fs.writeFileSync(cleanedCsvPath, outputs.cleanedCsv);
    outputFiles.push(cleanedCsvPath);
    console.log(`   ✅ Cleaned CSV: ${cleanedCsvPath}`);

    // Write validation report JSON
    const validationJsonPath = path.join(outputDir, "validation_report.json");
    fs.writeFileSync(validationJsonPath, outputs.validationReportJson);
    outputFiles.push(validationJsonPath);
    console.log(`   ✅ Validation report: ${validationJsonPath}`);

    // Write summary report
    const summaryPath = path.join(outputDir, "summary_report.md");
    fs.writeFileSync(summaryPath, outputs.summaryReportMd);
    outputFiles.push(summaryPath);
    console.log(`   ✅ Summary report: ${summaryPath}`);

    // Write error report
    const errorPath = path.join(outputDir, "error_report.md");
    fs.writeFileSync(errorPath, outputs.errorReportMd);
    outputFiles.push(errorPath);
    console.log(`   ✅ Error report: ${errorPath}`);

    // Write column mapping report
    const mappingPath = path.join(outputDir, "column_mapping.md");
    fs.writeFileSync(mappingPath, outputs.columnMappingMd);
    outputFiles.push(mappingPath);
    console.log(`   ✅ Column mapping: ${mappingPath}`);

    const totalTime = Date.now() - startTime;

    const stats = {
      processingTimeMs: totalTime,
      inputRecords: csvResult.totalRows,
      outputRecords: finalCleanedRecords.length,
      successRate: (
        (finalCleanedRecords.length / csvResult.totalRows) *
        100
      ).toFixed(1),
      duplicatesFound: duplicateResult.summary.totalDuplicates,
      partialMatches: duplicateResult.summary.partialMatches,
      transformations: cleaningResult.summary.totalTransformations,
      errors: allErrors.length,
      warnings: allWarnings.length,
    };

    console.log("\n🎉 Data cleaning completed successfully!");
    console.log(`⏱️  Processing time: ${totalTime}ms`);
    console.log(`📊 Success rate: ${stats.successRate}%`);
    console.log(`📁 Output files generated: ${outputFiles.length}`);

    return {
      success: true,
      message: "Data cleaning completed successfully",
      stats,
      outputFiles,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error during data cleaning:", errorMessage);

    return {
      success: false,
      message: `Data cleaning failed: ${errorMessage}`,
      stats: {},
      outputFiles: [],
    };
  }
}

/**
 * Run the data cleaning process with the provided CSV file
 */
async function main() {
  const csvPath = path.join(__dirname, "../../data/roster.csv");
  const outputPath = path.join(__dirname, "../../data/cleaned");

  console.log("🔧 Tennis Roster Data Cleaning Toolkit");
  console.log("=====================================");
  console.log(`📂 Input CSV: ${csvPath}`);
  console.log(`📁 Output directory: ${outputPath}`);
  console.log("");

  const result = await cleanRosterData(csvPath, outputPath);

  if (result.success) {
    console.log("\n✅ CLEANING SUMMARY:");
    console.log("====================");
    Object.entries(result.stats).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    console.log("\n📁 Generated Files:");
    result.outputFiles.forEach((file) => console.log(`   - ${file}`));
  } else {
    console.error("\n❌ CLEANING FAILED:");
    console.error(result.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

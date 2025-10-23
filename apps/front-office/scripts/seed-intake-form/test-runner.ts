#!/usr/bin/env tsx

import path from "path";
import { fileURLToPath } from "url";
import { parseIntakeFormCSV, filterApprovedRecords } from "./csv-parser";
import {
  processIntakeFormRow,
  generateProcessingReport,
} from "./data-processor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script to analyze the CSV data and mapping without touching the database
 */
async function testDataProcessing() {
  console.log("🧪 Testing data processing (no database operations)...\n");

  try {
    // Parse CSV
    const csvPath = path.join(
      __dirname,
      "../../app/features/user/intake-form.csv"
    );
    const allRecords = await parseIntakeFormCSV(csvPath);
    console.log(`📊 Parsed ${allRecords.length} total records`);

    // Filter approved
    const approvedRecords = filterApprovedRecords(allRecords);
    console.log(`✅ ${approvedRecords.length} approved records`);

    // Process first 10 records for testing
    const testRecords = approvedRecords.slice(0, 10);
    console.log(
      `\n🔬 Processing first ${testRecords.length} records for analysis...\n`
    );

    const processedData = testRecords.map((record, index) => {
      console.log(`Processing record ${index + 1}:`);
      console.log(`  Name: ${record.firstName} ${record.lastName}`);
      console.log(`  Email: ${record.email || record.emailAddress}`);
      console.log(`  District: ${record.district}`);
      console.log(`  Gender: ${record.gender || record.genderDetailed}`);
      console.log(`  Tennis Ranking: ${record.tennisRanking}`);

      const processed = processIntakeFormRow(record);

      console.log(`  → Mapped Gender: ${processed.gender}`);
      console.log(`  → Mapped District: ${processed.district}`);
      console.log(`  → Mapped Tennis Ranking: ${processed.tennisRanking}`);
      console.log(
        `  → Processing Notes: ${
          processed.processingNotes.join(", ") || "None"
        }`
      );
      console.log("");

      return processed;
    });

    // Generate report for all approved records
    console.log("📋 Generating full processing report...\n");
    const allProcessedData = approvedRecords.map(record =>
      processIntakeFormRow(record)
    );
    const report = generateProcessingReport(allProcessedData);

    console.log(`Total records: ${report.totalRecords}`);
    console.log(`Valid records: ${report.validRecords}`);
    console.log(`Invalid records: ${report.invalidRecords}`);
    console.log(
      `Success rate: ${(
        (report.validRecords / report.totalRecords) *
        100
      ).toFixed(1)}%`
    );

    if (report.mappingIssues.length > 0) {
      console.log("\n⚠ Mapping Issues:");
      report.mappingIssues
        .sort((a, b) => b.count - a.count)
        .forEach(issue => {
          console.log(`  ${issue.field}: ${issue.count} occurrences`);
        });
    }

    if (report.duplicateEmails.length > 0) {
      console.log(
        `\n🔄 Duplicate Emails Found: ${report.duplicateEmails.length}`
      );
      report.duplicateEmails
        .slice(0, 5)
        .forEach(email => console.log(`  - ${email}`));
      if (report.duplicateEmails.length > 5) {
        console.log(`  ... and ${report.duplicateEmails.length - 5} more`);
      }
    }

    console.log("\n✨ Test completed successfully!");
    console.log(
      "Run the main seeding script when ready to populate the database."
    );
  } catch (error) {
    console.error("❌ Error during testing:", error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testDataProcessing().catch(console.error);
}

export { testDataProcessing };

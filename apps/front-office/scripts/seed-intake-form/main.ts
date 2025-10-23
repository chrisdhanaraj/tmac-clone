#!/usr/bin/env tsx
import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";
import { parseIntakeFormCSV, validateRequiredFields } from "./csv-parser";
import {
  processIntakeFormRow,
  validateProcessedData,
  generateProcessingReport,
} from "./data-processor";
import { DatabaseSeeder } from "./database-seeder";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🎾 Starting TMAC Intake Form Database Seeding...\n");

  try {
    // 1. Parse CSV data
    console.log("📊 Parsing CSV data...");
    const csvPath = path.join(
      __dirname,
      "../../app/features/user/intake-form.csv"
    );
    const allRecords = await parseIntakeFormCSV(csvPath);
    console.log(`Found ${allRecords.length} total records`);

    // 2. Validate required fields (process ALL records, not just approved)
    console.log("\n✅ Validating required fields...");
    const validRecords = allRecords.filter(record => {
      const validation = validateRequiredFields(record);
      if (!validation.isValid) {
        console.log(
          `⚠ Skipping invalid record: ${
            record.email || "no email"
          } - ${validation.errors.join(", ")}`
        );
      }
      return validation.isValid;
    });
    console.log(`${validRecords.length} records passed validation`);

    // 3. Process data
    console.log("\n🔄 Processing and cleaning data...");
    const processedData = validRecords.map(record =>
      processIntakeFormRow(record)
    );

    // 4. Validate processed data
    const finalValidData = processedData.filter(data => {
      const validation = validateProcessedData(data);
      if (!validation.isValid) {
        console.log(
          `⚠ Skipping processed record: ${
            data.email
          } - ${validation.errors.join(", ")}`
        );
      }
      return validation.isValid;
    });

    console.log(
      `${finalValidData.length} records ready for database insertion`
    );

    // 5. Generate processing report
    console.log("\n📋 Processing Report:");
    const report = generateProcessingReport(processedData);
    console.log(`Total records processed: ${report.totalRecords}`);
    console.log(`Valid records: ${report.validRecords}`);
    console.log(`Invalid records: ${report.invalidRecords}`);

    // Report approval status breakdown
    const approvedCount = finalValidData.filter(data => data.approved).length;
    const notApprovedCount = finalValidData.length - approvedCount;
    console.log(`\n✅ Approved users: ${approvedCount}`);
    console.log(`❌ Not approved users: ${notApprovedCount}`);

    if (report.mappingIssues.length > 0) {
      console.log("\nMapping Issues:");
      report.mappingIssues.forEach(issue => {
        console.log(`  - ${issue.field}: ${issue.count} occurrences`);
      });
    }

    if (report.duplicateEmails.length > 0) {
      console.log(
        `\n⚠ Found ${report.duplicateEmails.length} duplicate emails:`
      );
      report.duplicateEmails.forEach(email => console.log(`  - ${email}`));
    }

    // 6. Confirm before proceeding
    console.log(
      `\n🚀 Ready to seed database with ${finalValidData.length} users.`
    );

    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed automatically

    // 7. Seed database
    console.log("\n💾 Upserting users in database...");
    const seeder = new DatabaseSeeder();

    try {
      const seedResults = await seeder.seedUsers(finalValidData);

      console.log("\n🎉 Upsert completed!");
      console.log(`Created: ${seedResults.created} users`);
      console.log(`Updated: ${seedResults.updated} users`);
      console.log(`Errors: ${seedResults.errors.length} users`);

      if (seedResults.errors.length > 0) {
        console.log("\nErrors:");
        seedResults.errors.forEach(error => {
          console.log(`  - ${error.email}: ${error.error}`);
        });
      }
    } finally {
      await seeder.disconnect();
    }
  } catch (error) {
    console.error("❌ Error during seeding process:", error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };

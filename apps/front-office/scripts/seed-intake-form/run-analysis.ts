#!/usr/bin/env tsx

/**
 * Quick analysis script to examine specific data patterns in the CSV
 * Useful for understanding data quality before seeding
 */

import path from "path";
import { fileURLToPath } from "url";
import { parseIntakeFormCSV, filterApprovedRecords } from "./csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeData() {
  console.log("🔍 Analyzing intake form data patterns...\n");

  const csvPath = path.join(
    __dirname,
    "../../app/features/user/intake-form.csv"
  );
  const allRecords = await parseIntakeFormCSV(csvPath);
  const approvedRecords = filterApprovedRecords(allRecords);

  console.log(`Total records: ${allRecords.length}`);
  console.log(`Approved records: ${approvedRecords.length}`);
  console.log(
    `Approval rate: ${(
      (approvedRecords.length / allRecords.length) *
      100
    ).toFixed(1)}%\n`
  );

  // Analyze gender values
  const genderValues = new Set(
    approvedRecords.map(r => r.gender || r.genderDetailed).filter(Boolean)
  );
  console.log("Gender values found:");
  Array.from(genderValues)
    .sort()
    .forEach(value => console.log(`  - "${value}"`));
  console.log("");

  // Analyze district values
  const districtValues = new Set(
    approvedRecords.map(r => r.district).filter(Boolean)
  );
  console.log("District values found:");
  Array.from(districtValues)
    .sort()
    .forEach(value => console.log(`  - "${value}"`));
  console.log("");

  // Analyze tennis ranking values
  const rankingValues = new Set(
    approvedRecords.map(r => r.tennisRanking).filter(Boolean)
  );
  console.log("Tennis ranking values found:");
  Array.from(rankingValues)
    .sort()
    .forEach(value => console.log(`  - "${value}"`));
  console.log("");

  // Analyze age values
  const ageValues = new Set(approvedRecords.map(r => r.age).filter(Boolean));
  console.log("Age values found:");
  Array.from(ageValues)
    .sort()
    .forEach(value => console.log(`  - "${value}"`));
  console.log("");

  // Analyze ethnicity values
  const ethnicityValues = new Set(
    approvedRecords.map(r => r.ethnicity).filter(Boolean)
  );
  console.log("Ethnicity values found:");
  Array.from(ethnicityValues)
    .sort()
    .forEach(value => console.log(`  - "${value}"`));
  console.log("");

  // Check for missing emails
  const recordsWithoutEmail = approvedRecords.filter(
    r => !r.email && !r.emailAddress
  );
  console.log(`Records without email: ${recordsWithoutEmail.length}`);

  // Check for missing names
  const recordsWithoutName = approvedRecords.filter(r => !r.firstName);
  console.log(`Records without first name: ${recordsWithoutName.length}`);

  console.log("\n✨ Analysis complete!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeData().catch(console.error);
}

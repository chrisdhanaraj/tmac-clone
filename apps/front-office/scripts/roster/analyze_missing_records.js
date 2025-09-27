#!/usr/bin/env node
/**
 * Script to analyze why we have fewer records than expected
 */

import "dotenv/config";
import { PrismaClient } from "../../app/generated/prisma/index.ts";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

async function analyzeImportGap() {
  console.log("🔍 ANALYZING IMPORT GAP");
  console.log("=".repeat(50));

  try {
    // Read the cleaned CSV to compare
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const csvFilePath = join(__dirname, "../data/roster_cleaned.csv");
    const fileContent = readFileSync(csvFilePath, "utf-8");
    const csvRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📊 CSV records: ${csvRecords.length}`);

    // Get database records
    const dbRecords = await prisma.tennisProfile.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`📊 Database records: ${dbRecords.length}`);
    console.log(
      `📊 Gap: ${csvRecords.length - dbRecords.length} missing records\n`
    );

    // Create email sets for comparison
    const csvEmails = new Set(
      csvRecords
        .map((r) => r.email?.toLowerCase().trim())
        .filter((email) => email && email !== "")
    );

    const dbEmails = new Set(
      dbRecords
        .map((r) => r.email?.toLowerCase().trim())
        .filter((email) => email && email !== "")
    );

    console.log(`📧 Unique emails in CSV: ${csvEmails.size}`);
    console.log(`📧 Unique emails in DB: ${dbEmails.size}\n`);

    // Find emails in CSV but not in DB
    const missingEmails = [];
    for (const email of csvEmails) {
      if (!dbEmails.has(email)) {
        missingEmails.push(email);
      }
    }

    console.log(`❌ Missing emails (${missingEmails.length}):`);
    missingEmails.slice(0, 20).forEach((email, i) => {
      const csvRecord = csvRecords.find(
        (r) => r.email?.toLowerCase().trim() === email
      );
      console.log(
        `${i + 1}. ${csvRecord?.firstName || "null"} ${
          csvRecord?.lastName || "null"
        } (${email})`
      );
    });

    if (missingEmails.length > 20) {
      console.log(`... and ${missingEmails.length - 20} more`);
    }

    // Find duplicate emails in CSV
    const emailCounts = {};
    csvRecords.forEach((record) => {
      const email = record.email?.toLowerCase().trim();
      if (email && email !== "") {
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      }
    });

    const duplicateEmails = Object.entries(emailCounts)
      .filter(([email, count]) => count > 1)
      .sort(([, a], [, b]) => b - a);

    console.log(`\n🔄 Duplicate emails in CSV (${duplicateEmails.length}):`);
    duplicateEmails.slice(0, 10).forEach(([email, count]) => {
      console.log(`- ${email}: ${count} times`);
    });

    // Find records without emails
    const recordsWithoutEmail = csvRecords.filter(
      (r) => !r.email || r.email.trim() === ""
    );
    console.log(`\n📭 Records without email: ${recordsWithoutEmail.length}`);

    // Calculate expected vs actual
    const totalDuplicates = duplicateEmails.reduce(
      (sum, [, count]) => sum + (count - 1),
      0
    );
    const expectedImports =
      csvRecords.length - recordsWithoutEmail.length - totalDuplicates;

    console.log(`\n📊 SUMMARY:`);
    console.log(`CSV total: ${csvRecords.length}`);
    console.log(`Records without email: ${recordsWithoutEmail.length}`);
    console.log(`Duplicate entries: ${totalDuplicates}`);
    console.log(`Expected imports: ${expectedImports}`);
    console.log(`Actual imports: ${dbRecords.length}`);
    console.log(`Still missing: ${expectedImports - dbRecords.length}`);
  } catch (error) {
    console.error("Error analyzing import gap:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeImportGap();

#!/usr/bin/env tsx
import "dotenv/config";

import prisma from "../../app/config/prisma";
import { parseIntakeFormCSV } from "./csv-parser";
import { cleanEmail, parseBoolean } from "./data-cleaners";
import path from "path";

interface BackfillResult {
  updated: number;
  notFound: number;
  errors: { email: string; error: string }[];
  summary: {
    totalCsvRecords: number;
    totalDbUsers: number;
    approvedCount: number;
    notApprovedCount: number;
  };
}

async function backfillApprovalStatus(): Promise<BackfillResult> {
  console.log("🚀 Starting approval status backfill...");

  const result: BackfillResult = {
    updated: 0,
    notFound: 0,
    errors: [],
    summary: {
      totalCsvRecords: 0,
      totalDbUsers: 0,
      approvedCount: 0,
      notApprovedCount: 0,
    },
  };

  try {
    // Parse CSV data
    const csvPath = path.join(__dirname, "../../features/user/intake-form.csv");
    console.log(`📄 Reading CSV from: ${csvPath}`);

    const csvRecords = await parseIntakeFormCSV(csvPath);
    result.summary.totalCsvRecords = csvRecords.length;
    console.log(`📊 Found ${csvRecords.length} records in CSV`);

    // Get all existing users with tennis profiles
    const existingUsers = await prisma.user.findMany({
      include: {
        tennisProfile: true,
      },
      where: {
        tennisProfile: {
          isNot: null,
        },
      },
    });

    result.summary.totalDbUsers = existingUsers.length;
    console.log(`🗃️  Found ${existingUsers.length} users in database`);

    // Create email to approval status mapping from CSV
    const emailToApprovalMap = new Map<string, boolean>();

    for (const csvRecord of csvRecords) {
      // Use primary email, fallback to secondary
      const primaryEmail = cleanEmail(csvRecord.email);
      const secondaryEmail = cleanEmail(csvRecord.emailAddress);
      const email = primaryEmail || secondaryEmail;

      if (email) {
        const approved = parseBoolean(csvRecord.approved);
        emailToApprovalMap.set(email.toLowerCase(), approved);

        if (approved) {
          result.summary.approvedCount++;
        } else {
          result.summary.notApprovedCount++;
        }
      }
    }

    console.log(
      `📋 Processed ${emailToApprovalMap.size} unique email mappings`
    );
    console.log(`✅ Approved: ${result.summary.approvedCount}`);
    console.log(`❌ Not approved: ${result.summary.notApprovedCount}`);

    // Update users based on CSV data
    for (const user of existingUsers) {
      if (!user.email) {
        result.errors.push({
          email: "unknown",
          error: `User ${user.id} has no email`,
        });
        continue;
      }

      const userEmail = user.email.toLowerCase();
      const approvalStatus = emailToApprovalMap.get(userEmail);

      if (approvalStatus === undefined) {
        result.notFound++;
        console.log(`⚠️  No CSV record found for: ${user.email}`);
        continue;
      }

      try {
        // Update user approval status
        await prisma.user.update({
          where: { id: user.id },
          data: { approved: approvalStatus },
        });

        result.updated++;
        const status = approvalStatus ? "✅ APPROVED" : "❌ NOT APPROVED";
        console.log(
          `🔄 Updated ${user.firstName} ${user.lastName} (${user.email}): ${status}`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push({
          email: user.email,
          error: errorMessage,
        });
        console.error(`❌ Error updating ${user.email}: ${errorMessage}`);
      }
    }

    return result;
  } catch (error) {
    console.error("💥 Fatal error during backfill:", error);
    throw error;
  }
}

async function main() {
  try {
    const result = await backfillApprovalStatus();

    console.log("\n" + "=".repeat(60));
    console.log("📈 BACKFILL SUMMARY");
    console.log("=".repeat(60));
    console.log(`📄 CSV Records: ${result.summary.totalCsvRecords}`);
    console.log(`🗃️  Database Users: ${result.summary.totalDbUsers}`);
    console.log(`🔄 Updated: ${result.updated}`);
    console.log(`⚠️  Not Found in CSV: ${result.notFound}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`✅ Total Approved in CSV: ${result.summary.approvedCount}`);
    console.log(
      `❌ Total Not Approved in CSV: ${result.summary.notApprovedCount}`
    );

    if (result.errors.length > 0) {
      console.log("\n🚨 ERRORS:");
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.email}: ${error.error}`);
      });
    }

    console.log("\n✨ Backfill completed successfully!");
  } catch (error) {
    console.error("💥 Backfill failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

export { backfillApprovalStatus };

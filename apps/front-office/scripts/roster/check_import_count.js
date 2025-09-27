#!/usr/bin/env node
/**
 * Script to check the actual count of imported tennis profiles
 */

import "dotenv/config";
import { PrismaClient } from "../../app/generated/prisma/index.ts";

const prisma = new PrismaClient();

async function checkImportCount() {
  try {
    // Get total count
    const totalCount = await prisma.tennisProfile.count();
    console.log(`📊 Total TennisProfile records in database: ${totalCount}`);

    // Get count by some sample fields to verify data quality
    const withFirstName = await prisma.tennisProfile.count({
      where: { firstName: { not: null } },
    });

    const withLastName = await prisma.tennisProfile.count({
      where: { lastName: { not: null } },
    });

    const withEmail = await prisma.tennisProfile.count({
      where: { email: { not: null } },
    });

    const withUserId = await prisma.tennisProfile.count({
      where: { userId: { not: null } },
    });

    console.log(`📝 Records with firstName: ${withFirstName}`);
    console.log(`📝 Records with lastName: ${withLastName}`);
    console.log(`📧 Records with email: ${withEmail}`);
    console.log(
      `👤 Records with userId (linked to user account): ${withUserId}`
    );

    // Check for any recent records (imported today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayImports = await prisma.tennisProfile.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    console.log(`🕐 Records created today: ${todayImports}`);

    // Get a few sample records to verify structure
    const sampleRecords = await prisma.tennisProfile.findMany({
      take: 3,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("\n📋 Sample records:");
    sampleRecords.forEach((record, index) => {
      console.log(
        `${index + 1}. ${record.firstName || "null"} ${
          record.lastName || "null"
        } (${record.email}) - Created: ${record.createdAt}`
      );
    });
  } catch (error) {
    console.error("Error checking import count:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImportCount();

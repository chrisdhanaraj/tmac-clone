#!/usr/bin/env tsx
/**
 * Script to import cleaned roster CSV data into TennisProfile table using Prisma
 */

import 'dotenv/config';
import { PrismaClient, Gender, AgeRange, Ethnicity, District, TmacGearPreference, GearSize, TennisRanking } from "../../app/generated/prisma";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

interface CleanedRosterRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  ageRange: string;
  birthDate: string;
  ethnicity: string;
  instagramHandle: string;
  district: string;
  tennisRanking: string;
  favoriteTennisPlayer: string;
  tmacGearPreference: string;
  gearSize: string;
  playlistSong: string;
  whyJoinTmac: string;
  referredBy: string;
}

interface ImportOptions {
  dryRun?: boolean;
  batchSize?: number;
  skipDuplicates?: boolean;
}

interface ImportStats {
  totalRecords: number;
  imported: number;
  skipped: number;
  duplicates: number;
  errors: number;
}

// Validation functions for enum fields
function validateGender(value: string): Gender | null {
  if (!value) return null;
  return Object.values(Gender).includes(value as Gender) ? (value as Gender) : null;
}

function validateAgeRange(value: string): AgeRange | null {
  if (!value) return null;
  return Object.values(AgeRange).includes(value as AgeRange) ? (value as AgeRange) : null;
}

function validateEthnicity(value: string): Ethnicity | null {
  if (!value) return null;
  return Object.values(Ethnicity).includes(value as Ethnicity) ? (value as Ethnicity) : null;
}

function validateDistrict(value: string): District | null {
  if (!value) return null;
  return Object.values(District).includes(value as District) ? (value as District) : null;
}

function validateTmacGearPreference(value: string): TmacGearPreference | null {
  if (!value) return null;
  return Object.values(TmacGearPreference).includes(value as TmacGearPreference) ? (value as TmacGearPreference) : null;
}

function validateGearSize(value: string): GearSize | null {
  if (!value) return null;
  return Object.values(GearSize).includes(value as GearSize) ? (value as GearSize) : null;
}

function validateTennisRanking(value: string): TennisRanking | null {
  if (!value) return null;
  return Object.values(TennisRanking).includes(value as TennisRanking) ? (value as TennisRanking) : null;
}

function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function cleanStringValue(value: string): string | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'n/a') {
    return null;
  }
  return value.trim();
}

function transformRecord(record: CleanedRosterRecord) {
  return {
    firstName: cleanStringValue(record.firstName),
    lastName: cleanStringValue(record.lastName),
    email: cleanStringValue(record.email),
    phone: cleanStringValue(record.phone),
    gender: validateGender(record.gender),
    ageRange: validateAgeRange(record.ageRange),
    birthDate: parseDate(record.birthDate),
    ethnicity: validateEthnicity(record.ethnicity),
    instagramHandle: cleanStringValue(record.instagramHandle),
    district: validateDistrict(record.district),
    tennisRanking: validateTennisRanking(record.tennisRanking),
    favoriteTennisPlayer: cleanStringValue(record.favoriteTennisPlayer),
    tmacGearPreference: validateTmacGearPreference(record.tmacGearPreference),
    gearSize: validateGearSize(record.gearSize),
    playlistSong: cleanStringValue(record.playlistSong),
    whyJoinTmac: cleanStringValue(record.whyJoinTmac),
    referredBy: cleanStringValue(record.referredBy),
  };
}

async function checkForDuplicates(records: CleanedRosterRecord[]): Promise<Set<string>> {
  console.log('🔍 Checking for existing profiles...');
  
  const emails = records
    .map(r => r.email)
    .filter(email => email && email.trim() !== '')
    .map(email => email.trim().toLowerCase());

  const existingProfiles = await prisma.tennisProfile.findMany({
    where: {
      email: {
        in: emails,
      },
    },
    select: {
      email: true,
    },
  });

  const existingEmails = new Set(
    existingProfiles
      .map(p => p.email)
      .filter(Boolean)
      .map(email => email.toLowerCase())
  );

  console.log(`   Found ${existingEmails.size} existing profiles`);
  return existingEmails;
}

async function importBatch(
  records: CleanedRosterRecord[],
  existingEmails: Set<string>,
  options: ImportOptions
): Promise<{ imported: number; skipped: number; duplicates: number; errors: number }> {
  const results = { imported: 0, skipped: 0, duplicates: 0, errors: 0 };

  for (const record of records) {
    try {
      // Check for duplicate
      if (record.email && existingEmails.has(record.email.toLowerCase())) {
        console.log(`   ⚠️  Skipping duplicate: ${record.email}`);
        results.duplicates++;
        continue;
      }

      // Skip records without email
      if (!record.email || record.email.trim() === '') {
        console.log(`   ⚠️  Skipping record without email: ${record.firstName} ${record.lastName}`);
        results.skipped++;
        continue;
      }

      // Transform and validate record
      const transformedRecord = transformRecord(record);

      // Skip if critical fields are missing
      if (!transformedRecord.firstName && !transformedRecord.lastName) {
        console.log(`   ⚠️  Skipping record without name: ${record.email}`);
        results.skipped++;
        continue;
      }

      if (options.dryRun) {
        console.log(`   📝 [DRY RUN] Would import: ${transformedRecord.firstName} ${transformedRecord.lastName} (${transformedRecord.email})`);
        results.imported++;
      } else {
        // Create the profile
        await prisma.tennisProfile.create({
          data: transformedRecord,
        });

        console.log(`   ✅ Imported: ${transformedRecord.firstName} ${transformedRecord.lastName} (${transformedRecord.email})`);
        results.imported++;

        // Add to existing emails to prevent duplicates in subsequent batches
        if (transformedRecord.email) {
          existingEmails.add(transformedRecord.email.toLowerCase());
        }
      }
    } catch (error) {
      console.error(`   ❌ Error importing ${record.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.errors++;
    }
  }

  return results;
}

async function importTennisProfiles(options: ImportOptions = {}): Promise<ImportStats> {
  const {
    dryRun = false,
    batchSize = 100,
    skipDuplicates = true,
  } = options;

  console.log('🎾 Starting Tennis Profile Import');
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  console.log(`   Batch size: ${batchSize}`);
  console.log('');

  try {
    // Read and parse the CSV file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const csvFilePath = join(__dirname, "../../data/roster_cleaned.csv");
    
    console.log(`📂 Reading CSV from: ${csvFilePath}`);
    const fileContent = readFileSync(csvFilePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CleanedRosterRecord[];

    console.log(`📊 Found ${records.length} records to process`);
    console.log('');

    // Check for existing duplicates
    const existingEmails = skipDuplicates ? await checkForDuplicates(records) : new Set<string>();

    // Process records in batches
    const stats: ImportStats = {
      totalRecords: records.length,
      imported: 0,
      skipped: 0,
      duplicates: 0,
      errors: 0,
    };

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(records.length / batchSize);

      console.log(`🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} records)`);

      const batchResults = await importBatch(batch, existingEmails, options);

      stats.imported += batchResults.imported;
      stats.skipped += batchResults.skipped;
      stats.duplicates += batchResults.duplicates;
      stats.errors += batchResults.errors;

      console.log(`   Batch results: ${batchResults.imported} imported, ${batchResults.skipped} skipped, ${batchResults.duplicates} duplicates, ${batchResults.errors} errors`);
      console.log('');
    }

    return stats;
  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  }
}

function printImportSummary(stats: ImportStats, dryRun: boolean) {
  console.log('📋 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total records processed: ${stats.totalRecords}`);
  console.log(`${dryRun ? 'Would import' : 'Successfully imported'}: ${stats.imported}`);
  console.log(`Skipped (missing data): ${stats.skipped}`);
  console.log(`Duplicates found: ${stats.duplicates}`);
  console.log(`Errors encountered: ${stats.errors}`);
  console.log('');

  if (dryRun) {
    console.log('🔍 This was a dry run. No data was actually imported.');
    console.log('💡 Run without --dry-run flag to perform actual import.');
  } else {
    console.log(`✨ Import complete! ${stats.imported} tennis profiles added to database.`);
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 100;

  try {
    const stats = await importTennisProfiles({
      dryRun,
      batchSize,
      skipDuplicates: true,
    });

    printImportSummary(stats, dryRun);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { importTennisProfiles };
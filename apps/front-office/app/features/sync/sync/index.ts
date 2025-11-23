import { DatabaseSeeder } from "./database-seeder";
import {
  fetchIntakeFormRowsFromSheet,
  validateRequiredFields,
} from "./sheet-reader";
import {
  generateProcessingReport,
  processIntakeFormRow,
  validateProcessedData,
} from "./data-processor";
import type { IntakeFormRow, ProcessedUserData } from "./types";
import { logger } from "@tmac/shared/logger";

type SeederLike = Pick<DatabaseSeeder, "seedUsers" | "disconnect">;

export interface IntakeSyncResult {
  totalRows: number;
  validRows: number;
  processedRows: number;
  created: number;
  updated: number;
  errors: { email: string; error: string }[];
  report: ReturnType<typeof generateProcessingReport>;
  skippedRows: { email: string | null; reason: string }[];
}

export interface IntakeSyncOptions {
  sheetId?: string;
  range?: string;
  fetchRows?: () => Promise<IntakeFormRow[]>;
  seeder?: SeederLike;
}

export async function syncIntakeFromGoogleSheet(
  options: IntakeSyncOptions = {}
): Promise<IntakeSyncResult> {
  const fetchRows =
    options.fetchRows ??
    (() =>
      fetchIntakeFormRowsFromSheet({
        sheetId: options.sheetId,
        range: options.range,
      }));

  const seeder: SeederLike = options.seeder ?? new DatabaseSeeder();

  logger.info("📥 Fetching intake rows from Google Sheets...");
  const rawRows = await fetchRows();
  logger.info(`   • Retrieved ${rawRows.length} total rows`);

  const skippedRows: { email: string | null; reason: string }[] = [];

  const validRawRows = rawRows.filter(row => {
    const validation = validateRequiredFields(row);
    if (!validation.isValid) {
      skippedRows.push({
        email: row.email || row.emailAddress || null,
        reason: validation.errors.join(", "),
      });
      logger.warn(
        `⚠️ Skipping raw row ${
          row.email || row.emailAddress || "unknown email"
        }: ${validation.errors.join(", ")}`
      );
      return false;
    }
    return true;
  });

  logger.info(`   • ${validRawRows.length} rows passed raw validation`);

  const processedData: ProcessedUserData[] = validRawRows.map(row =>
    processIntakeFormRow(row)
  );

  const finalValidData = processedData.filter(data => {
    const validation = validateProcessedData(data);
    if (!validation.isValid) {
      skippedRows.push({
        email: data.email,
        reason: validation.errors.join(", "),
      });
      logger.warn(
        `⚠️ Skipping processed row ${data.email}: ${validation.errors.join(
          ", "
        )}`
      );
      return false;
    }
    return true;
  });

  logger.info(`   • ${finalValidData.length} rows ready for Prisma upsert`);

  const report = generateProcessingReport(processedData);
  logger.info(
    `📊 Report: ${report.validRecords} valid / ${report.invalidRecords} invalid`
  );

  try {
    const seedResults = await seeder.seedUsers(finalValidData);
    logger.info(
      `💾 Upsert finished: created=${seedResults.created}, updated=${seedResults.updated}, errors=${seedResults.errors.length}`
    );

    return {
      totalRows: rawRows.length,
      validRows: validRawRows.length,
      processedRows: finalValidData.length,
      created: seedResults.created,
      updated: seedResults.updated,
      errors: seedResults.errors,
      report,
      skippedRows,
    };
  } finally {
    await seeder.disconnect();
  }
}

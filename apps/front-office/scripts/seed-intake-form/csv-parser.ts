import fs from "fs";
import { parse } from "csv-parse/sync";
import type { IntakeFormRow } from "./types";

export async function parseIntakeFormCSV(
  filePath: string
): Promise<IntakeFormRow[]> {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Parse CSV with headers
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Map to our interface structure
  const mappedRecords: IntakeFormRow[] = records.map((record: any) => ({
    timestamp: record["Timestamp"] || "",
    approved: record["Approved"] || "",
    gender: record["Gender"] || "",
    firstName: record["What is your first name?"] || "",
    lastName: record["What is your last name?"] || "",
    email: record["Email"] || "",
    phone: record["Phone Number (WhatsApp)"] || "",
    district: record["What district do you live in?"] || "",
    gearPreference:
      record["What's the first piece of TMAC gear we should launch?"] || "",
    gearSize: record["What size are you?"] || "",
    playlistSong:
      record[
        "What song would you add to The Mission Athletic Club playlist?"
      ] || "",
    whyJoin: record["Why do you wanna join The Mission Athletic Club?"] || "",
    referredBy: record["Who referred you?"] || "",
    playsTennis: record["Do you play Tennis?"] || "",
    tennisRanking: record["What is your Tennis Ranking?"] || "",
    favoriteTennisPlayer: record["Who is your favorite Tennis player?"] || "",
    instagram: record["What is your Instagram?"] || "",
    emailAddress: record["Email Address"] || "",
    genderDetailed: record["Which most closely describes your gender?"] || "",
    age: record["Age"] || "",
    birthDate: record["Birth Date"] || "",
    ethnicity: record["Ethnicity"] || "",
    birthdayCelebration:
      record["Are you okay with us celebrating your birthday in some way?"] ||
      "",
    ...record, // Include any additional columns
  }));

  return mappedRecords;
}

export function filterApprovedRecords(
  records: IntakeFormRow[]
): IntakeFormRow[] {
  return records.filter(record => {
    const approved = record.approved.toLowerCase().trim();
    return approved === "true" || approved === "yes" || approved === "1";
  });
}

export function validateRequiredFields(record: IntakeFormRow): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Email is required
  if (!record.email && !record.emailAddress) {
    errors.push("Missing email address");
  }

  // At least first name should be present
  if (!record.firstName) {
    errors.push("Missing first name");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

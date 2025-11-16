import { sheets_v4 } from "@googleapis/sheets";
import { GoogleAuth, type GoogleAuthOptions } from "google-auth-library";

import type { IntakeFormRow } from "./types";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_RANGE = process.env.GOOGLE_SHEET_RANGE ?? "Form Responses 1";

export type SheetRecord = Record<string, string>;

export function buildRecordFromRow(
  headers: string[],
  row: (string | number | null | undefined)[]
): SheetRecord {
  return headers.reduce<SheetRecord>((acc, header, index) => {
    if (!header) {
      return acc;
    }

    const cell = row[index];
    if (cell === undefined || cell === null) {
      acc[header] = "";
      return acc;
    }

    acc[header] = typeof cell === "string" ? cell.trim() : String(cell).trim();
    return acc;
  }, {});
}

export function mapRecordToIntakeFormRow(record: SheetRecord): IntakeFormRow {
  const get = (key: string) => record[key] ?? "";

  return {
    timestamp: get("Timestamp"),
    approved: get("Approved"),
    gender: get("Gender"),
    firstName: get("What is your first name?"),
    lastName: get("What is your last name?"),
    email: get("Email"),
    phone: get("Phone Number (WhatsApp)"),
    district: get("What district do you live in?"),
    gearPreference: get(
      "What's the first piece of TMAC gear we should launch?"
    ),
    gearSize: get("What size are you?"),
    playlistSong: get(
      "What song would you add to The Mission Athletic Club playlist?"
    ),
    whyJoin: get("Why do you wanna join The Mission Athletic Club?"),
    referredBy: get("Who referred you?"),
    playsTennis: get("Do you play Tennis?"),
    tennisRanking: get("What is your Tennis Ranking?"),
    favoriteTennisPlayer: get("Who is your favorite Tennis player?"),
    instagram: get("What is your Instagram?"),
    emailAddress: get("Email Address"),
    genderDetailed: get("Which most closely describes your gender?"),
    age: get("Age"),
    birthDate: get("Birth Date"),
    ethnicity: get("Ethnicity"),
    birthdayCelebration: get(
      "Are you okay with us celebrating your birthday in some way?"
    ),
    ...record,
  };
}

export function validateRequiredFields(record: IntakeFormRow): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!record.email && !record.emailAddress) {
    errors.push("Missing email address");
  }

  if (!record.firstName) {
    errors.push("Missing first name");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function filterApprovedRecords(
  records: IntakeFormRow[]
): IntakeFormRow[] {
  return records.filter(record => {
    const approved = record.approved.toLowerCase().trim();
    return approved === "true" || approved === "yes" || approved === "1";
  });
}

export async function fetchIntakeFormRowsFromSheet({
  sheetId = process.env.GOOGLE_SHEET_ID,
  range = DEFAULT_RANGE,
}: {
  sheetId?: string;
  range?: string;
} = {}): Promise<IntakeFormRow[]> {
  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  let credentials: GoogleAuthOptions["credentials"];
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: [SHEETS_SCOPE],
  });

  const sheets = new sheets_v4.Sheets({ auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const values = response.data.values;
  if (!values || values.length === 0) {
    return [];
  }

  const [headers, ...rows] = values;
  return rows
    .map(row => buildRecordFromRow(headers, row))
    .filter(record => Object.values(record).some(value => value?.trim().length))
    .map(mapRecordToIntakeFormRow);
}

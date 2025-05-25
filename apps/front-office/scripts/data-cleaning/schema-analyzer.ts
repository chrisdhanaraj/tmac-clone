/**
 * TennisProfile Schema Analysis
 *
 * This file contains the extracted schema structure from the Prisma schema file
 * for use in the AI agent data cleaning process.
 */

export interface TennisProfileSchema {
  id: string; // UUID, auto-generated
  userId: string | null; // Will be nullable for imported profiles
  email?: string; // For matching (not in schema but needed for process)
  phone?: string; // For matching (not in schema but needed for process)
  gender?: Gender;
  ageRange?: AgeRange;
  ethnicity?: Ethnicity;
  birthDate?: Date;
  instagramHandle?: string; // Max 50 chars
  district?: District;
  districtOther?: string; // Max 100 chars
  tmacGearPreference?: TmacGearPreference;
  tmacGearOther?: string; // Max 100 chars
  gearSize?: GearSize;
  playlistSong?: string; // Max 200 chars
  whyJoinTmac?: string; // Max 500 chars
  referredBy?: string; // Max 100 chars
  tennisRanking?: TennisRanking;
  favoriteTennisPlayer?: string; // Max 100 chars
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
  lastReminderAt?: Date;
}

// Enum definitions extracted from Prisma schema
export enum Gender {
  Woman = "Woman",
  Man = "Man",
  NonBinary = "NonBinary",
  Agender = "Agender",
  PreferNotToState = "PreferNotToState",
  Other = "Other",
}

export enum AgeRange {
  EIGHTEEN_TO_TWENTY_FIVE = "EIGHTEEN_TO_TWENTY_FIVE",
  TWENTY_SIX_TO_THIRTY_FIVE = "TWENTY_SIX_TO_THIRTY_FIVE",
  THIRTY_SIX_TO_FORTY_FIVE = "THIRTY_SIX_TO_FORTY_FIVE",
  FORTY_SIX_TO_FIFTY_FIVE = "FORTY_SIX_TO_FIFTY_FIVE",
  FIFTY_FIVE_PLUS = "FIFTY_FIVE_PLUS",
  PreferNotToState = "PreferNotToState",
}

export enum Ethnicity {
  AmericanIndianOrAlaskaNative = "AmericanIndianOrAlaskaNative",
  PacificIslander = "PacificIslander",
  BlackOrAfricanAmerican = "BlackOrAfricanAmerican",
  White = "White",
  Arab = "Arab",
  Asian = "Asian",
  HispanicOrLatinx = "HispanicOrLatinx",
  MixedRace = "MixedRace",
  Other = "Other",
}

export enum District {
  District1 = "District1",
  District2 = "District2",
  District3 = "District3",
  District4 = "District4",
  District5 = "District5",
  District6 = "District6",
  District7 = "District7",
  District8 = "District8",
  District9 = "District9",
  District10 = "District10",
  District11 = "District11",
  Other = "Other",
}

export enum TmacGearPreference {
  Hat = "Hat",
  Socks = "Socks",
  Shirt = "Shirt",
  Other = "Other",
}

export enum GearSize {
  XXS = "XXS",
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
}

export enum TennisRanking {
  ONE_ZERO = "ONE_ZERO",
  ONE_FIVE = "ONE_FIVE",
  TWO_ZERO = "TWO_ZERO",
  TWO_FIVE = "TWO_FIVE",
  THREE_ZERO = "THREE_ZERO",
  THREE_FIVE = "THREE_FIVE",
  FOUR_ZERO = "FOUR_ZERO",
  FOUR_FIVE = "FOUR_FIVE",
  FIVE_ZERO = "FIVE_ZERO",
  FIVE_FIVE = "FIVE_FIVE",
  SIX_ZERO = "SIX_ZERO",
  SIX_FIVE = "SIX_FIVE",
  SEVEN_ZERO = "SEVEN_ZERO",
}

// Field validation constraints
export const FIELD_CONSTRAINTS = {
  instagramHandle: { maxLength: 50 },
  districtOther: { maxLength: 100 },
  tmacGearOther: { maxLength: 100 },
  playlistSong: { maxLength: 200 },
  whyJoinTmac: { maxLength: 500 },
  referredBy: { maxLength: 100 },
  favoriteTennisPlayer: { maxLength: 100 },
} as const;

// Required fields for import (email or phone must be present)
export const REQUIRED_FOR_MATCHING = ["email", "phone"] as const;

// Schema validation function
export function validateTennisProfileField(field: string, value: any): boolean {
  switch (field) {
    case "gender":
      return (
        value === null ||
        value === undefined ||
        Object.values(Gender).includes(value)
      );
    case "ageRange":
      return (
        value === null ||
        value === undefined ||
        Object.values(AgeRange).includes(value)
      );
    case "ethnicity":
      return (
        value === null ||
        value === undefined ||
        Object.values(Ethnicity).includes(value)
      );
    case "district":
      return (
        value === null ||
        value === undefined ||
        Object.values(District).includes(value)
      );
    case "tmacGearPreference":
      return (
        value === null ||
        value === undefined ||
        Object.values(TmacGearPreference).includes(value)
      );
    case "gearSize":
      return (
        value === null ||
        value === undefined ||
        Object.values(GearSize).includes(value)
      );
    case "tennisRanking":
      return (
        value === null ||
        value === undefined ||
        Object.values(TennisRanking).includes(value)
      );
    case "birthDate":
      return (
        value === null ||
        value === undefined ||
        value instanceof Date ||
        !isNaN(Date.parse(value))
      );
    case "instagramHandle":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 50)
      );
    case "districtOther":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
      );
    case "tmacGearOther":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
      );
    case "playlistSong":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 200)
      );
    case "whyJoinTmac":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 500)
      );
    case "referredBy":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
      );
    case "favoriteTennisPlayer":
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
      );
    default:
      return true;
  }
}

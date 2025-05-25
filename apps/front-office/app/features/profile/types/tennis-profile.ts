import {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
  type Gender as GenderType,
  type AgeRange as AgeRangeType,
  type Ethnicity as EthnicityType,
  type District as DistrictType,
  type TmacGearPreference as TmacGearPreferenceType,
  type GearSize as GearSizeType,
  type TennisRanking as TennisRankingType,
} from "~/generated/prisma/enums";

// Re-export the enum objects and types
export {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
};
export type {
  GenderType,
  AgeRangeType,
  EthnicityType,
  DistrictType,
  TmacGearPreferenceType,
  GearSizeType,
  TennisRankingType,
};

// Client-safe TennisProfile type (based on Prisma model but without server dependencies)
export interface TennisProfile {
  id: string;
  userId: string;
  gender?: GenderType | null;
  ageRange?: AgeRangeType | null;
  ethnicity?: EthnicityType | null;
  birthDate?: Date | null;
  instagramHandle?: string | null;
  district?: DistrictType | null;
  districtOther?: string | null;
  tmacGearPreference?: TmacGearPreferenceType | null;
  tmacGearOther?: string | null;
  gearSize?: GearSizeType | null;
  playlistSong?: string | null;
  whyJoinTmac?: string | null;
  referredBy?: string | null;
  tennisRanking?: TennisRankingType | null;
  favoriteTennisPlayer?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastReminderAt?: Date | null;
}

// Create form-friendly versions of the types
export interface TennisProfileFormData {
  gender?: GenderType;
  ageRange?: AgeRangeType;
  ethnicity?: EthnicityType;
  birthDate?: string; // ISO date string for forms
  instagramHandle?: string;
  district?: DistrictType;
  districtOther?: string;
  tmacGearPreference?: TmacGearPreferenceType;
  tmacGearOther?: string;
  gearSize?: GearSizeType;
  playlistSong?: string;
  whyJoinTmac?: string;
  referredBy?: string;
  tennisRanking?: TennisRankingType;
  favoriteTennisPlayer?: string;
}

// Enum display labels for UI
export const GenderLabels: Record<GenderType, string> = {
  Woman: "Woman",
  Man: "Man",
  NonBinary: "Non-Binary",
  Agender: "Agender / I don't identify with any gender",
  PreferNotToState: "Prefer not to state",
  Other: "Other",
};

export const AgeRangeLabels: Record<AgeRangeType, string> = {
  EIGHTEEN_TO_TWENTY_FIVE: "18-25",
  TWENTY_SIX_TO_THIRTY_FIVE: "26-35",
  THIRTY_SIX_TO_FORTY_FIVE: "36-45",
  FORTY_SIX_TO_FIFTY_FIVE: "46-55",
  FIFTY_FIVE_PLUS: "55+",
  PreferNotToState: "Prefer not to state",
};

export const EthnicityLabels: Record<EthnicityType, string> = {
  AmericanIndianOrAlaskaNative: "American Indian or Alaska Native",
  PacificIslander: "Pacific Islander",
  BlackOrAfricanAmerican: "Black or African American",
  White: "White",
  Arab: "Arab",
  Asian: "Asian",
  HispanicOrLatinx: "Hispanic or Latinx/e",
  MixedRace: "Mixed-Race",
  Other: "Other",
};

export const DistrictLabels: Record<DistrictType, string> = {
  District1: "District 1 - Financial District / SOMA",
  District2: "District 2 - Pacific Heights / Marina",
  District3: "District 3 - Chinatown / North Beach",
  District4: "District 4 - Outer Sunset",
  District5: "District 5 - Haight / Fillmore",
  District6: "District 6 - SOMA / Mission Bay",
  District7: "District 7 - Inner Sunset",
  District8: "District 8 - Castro / Noe Valley",
  District9: "District 9 - Mission",
  District10: "District 10 - Potrero Hill / Dogpatch",
  District11: "District 11 - Excelsior / Outer Mission",
  Other: "Other (Bay Area)",
};

export const TmacGearPreferenceLabels: Record<TmacGearPreferenceType, string> =
  {
    Hat: "Hat / Cap",
    Socks: "Socks",
    Shirt: "T-Shirt / Tank Top",
    Other: "Other",
  };

export const GearSizeLabels: Record<GearSizeType, string> = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
};

export const TennisRankingLabels: Record<TennisRankingType, string> = {
  ONE_ZERO: "1.0",
  ONE_FIVE: "1.5",
  TWO_ZERO: "2.0",
  TWO_FIVE: "2.5",
  THREE_ZERO: "3.0",
  THREE_FIVE: "3.5",
  FOUR_ZERO: "4.0",
  FOUR_FIVE: "4.5",
  FIVE_ZERO: "5.0",
  FIVE_FIVE: "5.5",
  SIX_ZERO: "6.0",
  SIX_FIVE: "6.5",
  SEVEN_ZERO: "7.0",
};

// PII fields that should be kept private
export const PII_FIELDS: (keyof TennisProfileFormData)[] = [
  "gender",
  "ageRange",
  "ethnicity",
  "birthDate",
];

// Community-visible fields
export const COMMUNITY_VISIBLE_FIELDS: (keyof TennisProfileFormData)[] = [
  "instagramHandle",
  "district",
  "districtOther",
  "tennisRanking",
  "favoriteTennisPlayer",
];

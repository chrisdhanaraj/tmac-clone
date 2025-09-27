import {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "~/generated/prisma/enums";
import type { TennisProfile } from "~/generated/prisma/client";

// Create form-friendly versions of the types
export interface TennisProfileFormData {
  // Contact info for guest profiles
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Tennis profile fields
  gender?: Gender;
  ageRange?: AgeRange;
  ethnicity?: Ethnicity;
  birthDate?: string; // ISO date string for forms
  instagramHandle?: string;
  district?: District;
  districtOther?: string;
  tmacGearPreference?: TmacGearPreference;
  tmacGearOther?: string;
  gearSize?: GearSize;
  playlistSong?: string;
  whyJoinTmac?: string;
  referredBy?: string;
  tennisRanking?: TennisRanking;
  favoriteTennisPlayer?: string;
}

// Enum display labels for UI
export const GenderLabels: Record<Gender, string> = {
  Woman: "Woman",
  Man: "Man",
  NonBinary: "Non-Binary",
  Agender: "Agender / I don't identify with any gender",
  PreferNotToState: "Prefer not to state",
  Other: "Other",
};

export const AgeRangeLabels: Record<AgeRange, string> = {
  EIGHTEEN_TO_TWENTY_FIVE: "18-25",
  TWENTY_SIX_TO_THIRTY_FIVE: "26-35",
  THIRTY_SIX_TO_FORTY_FIVE: "36-45",
  FORTY_SIX_TO_FIFTY_FIVE: "46-55",
  FIFTY_FIVE_PLUS: "55+",
  PreferNotToState: "Prefer not to state",
};

export const EthnicityLabels: Record<Ethnicity, string> = {
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

export const DistrictLabels: Record<District, string> = {
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

export const TmacGearPreferenceLabels: Record<TmacGearPreference, string> = {
  Hat: "Hat / Cap",
  Socks: "Socks",
  Shirt: "T-Shirt / Tank Top",
  Other: "Other",
};

export const GearSizeLabels: Record<GearSize, string> = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
};

export const TennisRankingLabels: Record<TennisRanking, string> = {
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

/**
 * TennisProfile Enum Types Documentation
 *
 * This file documents all enum types used in the TennisProfile schema
 * with their valid values and mapping guidance for data cleaning.
 */

/**
 * Gender Enum
 * Represents gender identity options
 */
export enum Gender {
  Woman = "Woman",
  Man = "Man",
  NonBinary = "NonBinary",
  Agender = "Agender",
  PreferNotToState = "PreferNotToState",
  Other = "Other",
}

/**
 * Gender Mapping Guide
 * Common CSV values that should map to Gender enum values
 */
export const GENDER_MAPPING = {
  // Woman variants
  Woman: Gender.Woman,
  woman: Gender.Woman,
  W: Gender.Woman,
  w: Gender.Woman,
  f: Gender.Woman,
  F: Gender.Woman,
  female: Gender.Woman,
  Female: Gender.Woman,

  // Man variants
  Man: Gender.Man,
  man: Gender.Man,
  M: Gender.Man,
  m: Gender.Man,
  male: Gender.Man,
  Male: Gender.Man,

  // Non-binary variants
  NonBinary: Gender.NonBinary,
  "non-binary": Gender.NonBinary,
  "Non-Binary": Gender.NonBinary,
  "non binary": Gender.NonBinary,
  "Non Binary": Gender.NonBinary,
  nb: Gender.NonBinary,
  NB: Gender.NonBinary,

  // Other variants
  Other: Gender.Other,
  other: Gender.Other,
  n: Gender.Other,
  N: Gender.Other,

  // Prefer not to state
  PreferNotToState: Gender.PreferNotToState,
  "prefer not to state": Gender.PreferNotToState,
  "Prefer Not To State": Gender.PreferNotToState,
  decline: Gender.PreferNotToState,
  Decline: Gender.PreferNotToState,
} as const;

/**
 * Age Range Enum
 * Represents age brackets for demographics
 */
export enum AgeRange {
  EIGHTEEN_TO_TWENTY_FIVE = "EIGHTEEN_TO_TWENTY_FIVE",
  TWENTY_SIX_TO_THIRTY_FIVE = "TWENTY_SIX_TO_THIRTY_FIVE",
  THIRTY_SIX_TO_FORTY_FIVE = "THIRTY_SIX_TO_FORTY_FIVE",
  FORTY_SIX_TO_FIFTY_FIVE = "FORTY_SIX_TO_FIFTY_FIVE",
  FIFTY_FIVE_PLUS = "FIFTY_FIVE_PLUS",
  PreferNotToState = "PreferNotToState",
}

/**
 * Age Range Mapping Guide
 * Maps common age representations to AgeRange enum
 */
export const AGE_RANGE_MAPPING = {
  "18-25": AgeRange.EIGHTEEN_TO_TWENTY_FIVE,
  "18 - 25": AgeRange.EIGHTEEN_TO_TWENTY_FIVE,
  "18 to 25": AgeRange.EIGHTEEN_TO_TWENTY_FIVE,
  EIGHTEEN_TO_TWENTY_FIVE: AgeRange.EIGHTEEN_TO_TWENTY_FIVE,

  "26-35": AgeRange.TWENTY_SIX_TO_THIRTY_FIVE,
  "26 - 35": AgeRange.TWENTY_SIX_TO_THIRTY_FIVE,
  "26 to 35": AgeRange.TWENTY_SIX_TO_THIRTY_FIVE,
  TWENTY_SIX_TO_THIRTY_FIVE: AgeRange.TWENTY_SIX_TO_THIRTY_FIVE,

  "36-45": AgeRange.THIRTY_SIX_TO_FORTY_FIVE,
  "36 - 45": AgeRange.THIRTY_SIX_TO_FORTY_FIVE,
  "36 to 45": AgeRange.THIRTY_SIX_TO_FORTY_FIVE,
  THIRTY_SIX_TO_FORTY_FIVE: AgeRange.THIRTY_SIX_TO_FORTY_FIVE,

  "46-55": AgeRange.FORTY_SIX_TO_FIFTY_FIVE,
  "46 - 55": AgeRange.FORTY_SIX_TO_FIFTY_FIVE,
  "46 to 55": AgeRange.FORTY_SIX_TO_FIFTY_FIVE,
  FORTY_SIX_TO_FIFTY_FIVE: AgeRange.FORTY_SIX_TO_FIFTY_FIVE,

  "55+": AgeRange.FIFTY_FIVE_PLUS,
  "55 +": AgeRange.FIFTY_FIVE_PLUS,
  "55 plus": AgeRange.FIFTY_FIVE_PLUS,
  FIFTY_FIVE_PLUS: AgeRange.FIFTY_FIVE_PLUS,
  "over 55": AgeRange.FIFTY_FIVE_PLUS,

  PreferNotToState: AgeRange.PreferNotToState,
} as const;

/**
 * Ethnicity Enum
 * Represents ethnic background options
 */
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

/**
 * Ethnicity Mapping Guide
 */
export const ETHNICITY_MAPPING = {
  White: Ethnicity.White,
  white: Ethnicity.White,
  Caucasian: Ethnicity.White,
  caucasian: Ethnicity.White,

  Asian: Ethnicity.Asian,
  asian: Ethnicity.Asian,
  "Asian American": Ethnicity.Asian,

  Black: Ethnicity.BlackOrAfricanAmerican,
  black: Ethnicity.BlackOrAfricanAmerican,
  "African American": Ethnicity.BlackOrAfricanAmerican,
  "Black or African American": Ethnicity.BlackOrAfricanAmerican,
  BlackOrAfricanAmerican: Ethnicity.BlackOrAfricanAmerican,

  Hispanic: Ethnicity.HispanicOrLatinx,
  hispanic: Ethnicity.HispanicOrLatinx,
  Latino: Ethnicity.HispanicOrLatinx,
  latina: Ethnicity.HispanicOrLatinx,
  Latinx: Ethnicity.HispanicOrLatinx,
  HispanicOrLatinx: Ethnicity.HispanicOrLatinx,
  "Hispanic or Latinx/e": Ethnicity.HispanicOrLatinx,
  "Hispanic or Latinx": Ethnicity.HispanicOrLatinx,

  Arab: Ethnicity.Arab,
  arab: Ethnicity.Arab,
  "Middle Eastern": Ethnicity.Arab,
  "middle eastern": Ethnicity.Arab,

  "Pacific Islander": Ethnicity.PacificIslander,
  "pacific islander": Ethnicity.PacificIslander,
  PacificIslander: Ethnicity.PacificIslander,

  "American Indian": Ethnicity.AmericanIndianOrAlaskaNative,
  "Native American": Ethnicity.AmericanIndianOrAlaskaNative,
  "Alaska Native": Ethnicity.AmericanIndianOrAlaskaNative,
  AmericanIndianOrAlaskaNative: Ethnicity.AmericanIndianOrAlaskaNative,

  Mixed: Ethnicity.MixedRace,
  mixed: Ethnicity.MixedRace,
  "Mixed Race": Ethnicity.MixedRace,
  MixedRace: Ethnicity.MixedRace,
  Multiracial: Ethnicity.MixedRace,
  multiracial: Ethnicity.MixedRace,

  Other: Ethnicity.Other,
  other: Ethnicity.Other,
} as const;

/**
 * District Enum
 * Represents San Francisco districts
 */
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

/**
 * District Mapping Guide
 */
export const DISTRICT_MAPPING = {
  "District 1": District.District1,
  District1: District.District1,
  "district 1": District.District1,
  "1": District.District1,

  "District 2": District.District2,
  District2: District.District2,
  "district 2": District.District2,
  "2": District.District2,

  "District 3": District.District3,
  District3: District.District3,
  "district 3": District.District3,
  "3": District.District3,

  "District 4": District.District4,
  District4: District.District4,
  "district 4": District.District4,
  "4": District.District4,

  "District 5": District.District5,
  District5: District.District5,
  "district 5": District.District5,
  "5": District.District5,

  "District 6": District.District6,
  District6: District.District6,
  "district 6": District.District6,
  "6": District.District6,

  "District 7": District.District7,
  District7: District.District7,
  "district 7": District.District7,
  "7": District.District7,

  "District 8": District.District8,
  District8: District.District8,
  "district 8": District.District8,
  "8": District.District8,

  "District 9": District.District9,
  District9: District.District9,
  "district 9": District.District9,
  "9": District.District9,

  "District 10": District.District10,
  District10: District.District10,
  "district 10": District.District10,
  "10": District.District10,

  "District 11": District.District11,
  District11: District.District11,
  "district 11": District.District11,
  "11": District.District11,

  // Non-SF locations should map to Other
  Oakland: District.Other,
  oakland: District.Other,
  "San Jose": District.Other,
  Burlingame: District.Other,
  "Mountain View": District.Other,
  "Walnut Creek": District.Other,
  "East Bay": District.Other,
  "Napa Valley": District.Other,
  "Prescott, Oakland": District.Other,
  Martinez: District.Other,
  "Menlo Park": District.Other,
  "San Mateo county": District.Other,
  Other: District.Other,
  other: District.Other,
} as const;

/**
 * TMAC Gear Preference Enum
 */
export enum TmacGearPreference {
  Hat = "Hat",
  Socks = "Socks",
  Shirt = "Shirt",
  Other = "Other",
}

/**
 * TMAC Gear Preference Mapping Guide
 */
export const TMAC_GEAR_MAPPING = {
  Hat: TmacGearPreference.Hat,
  hat: TmacGearPreference.Hat,
  Hats: TmacGearPreference.Hat,
  hats: TmacGearPreference.Hat,

  Socks: TmacGearPreference.Socks,
  socks: TmacGearPreference.Socks,
  Sock: TmacGearPreference.Socks,
  sock: TmacGearPreference.Socks,

  Shirt: TmacGearPreference.Shirt,
  shirt: TmacGearPreference.Shirt,
  Shirts: TmacGearPreference.Shirt,
  shirts: TmacGearPreference.Shirt,
  "T-shirt": TmacGearPreference.Shirt,
  "t-shirt": TmacGearPreference.Shirt,

  Other: TmacGearPreference.Other,
  other: TmacGearPreference.Other,
  "necklace:)": TmacGearPreference.Other,
  "Pullover sweater with no hood": TmacGearPreference.Other,
  "Vanity plates": TmacGearPreference.Other,
  "Koozies, trucker hats, stickers, tennis bag?!": TmacGearPreference.Other,
  "Skirts and skorts": TmacGearPreference.Other,
  "Crewneck / sweater": TmacGearPreference.Other,
  Sweatshirt: TmacGearPreference.Other,
  Sweats: TmacGearPreference.Other,
  visor: TmacGearPreference.Other,
  "Tennis bag": TmacGearPreference.Other,
  "Bucket Hat - also have big thoughts on your Bay Series merch!":
    TmacGearPreference.Hat,
} as const;

/**
 * Gear Size Enum
 */
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

/**
 * Tennis Ranking Enum
 * Represents NTRP (National Tennis Rating Program) levels
 */
export enum TennisRanking {
  ONE_ZERO = "ONE_ZERO", // 1.0
  ONE_FIVE = "ONE_FIVE", // 1.5
  TWO_ZERO = "TWO_ZERO", // 2.0
  TWO_FIVE = "TWO_FIVE", // 2.5
  THREE_ZERO = "THREE_ZERO", // 3.0
  THREE_FIVE = "THREE_FIVE", // 3.5
  FOUR_ZERO = "FOUR_ZERO", // 4.0
  FOUR_FIVE = "FOUR_FIVE", // 4.5
  FIVE_ZERO = "FIVE_ZERO", // 5.0
  FIVE_FIVE = "FIVE_FIVE", // 5.5
  SIX_ZERO = "SIX_ZERO", // 6.0
  SIX_FIVE = "SIX_FIVE", // 6.5
  SEVEN_ZERO = "SEVEN_ZERO", // 7.0
}

/**
 * Tennis Ranking Mapping Guide
 */
export const TENNIS_RANKING_MAPPING = {
  "1": TennisRanking.ONE_ZERO,
  "1.0": TennisRanking.ONE_ZERO,
  ONE_ZERO: TennisRanking.ONE_ZERO,

  "1.5": TennisRanking.ONE_FIVE,
  ONE_FIVE: TennisRanking.ONE_FIVE,

  "2": TennisRanking.TWO_ZERO,
  "2.0": TennisRanking.TWO_ZERO,
  TWO_ZERO: TennisRanking.TWO_ZERO,

  "2.5": TennisRanking.TWO_FIVE,
  TWO_FIVE: TennisRanking.TWO_FIVE,

  "3": TennisRanking.THREE_ZERO,
  "3.0": TennisRanking.THREE_ZERO,
  THREE_ZERO: TennisRanking.THREE_ZERO,

  "3.5": TennisRanking.THREE_FIVE,
  THREE_FIVE: TennisRanking.THREE_FIVE,

  "4": TennisRanking.FOUR_ZERO,
  "4.0": TennisRanking.FOUR_ZERO,
  FOUR_ZERO: TennisRanking.FOUR_ZERO,

  "4.5": TennisRanking.FOUR_FIVE,
  FOUR_FIVE: TennisRanking.FOUR_FIVE,

  "5": TennisRanking.FIVE_ZERO,
  "5.0": TennisRanking.FIVE_ZERO,
  FIVE_ZERO: TennisRanking.FIVE_ZERO,

  "5.5": TennisRanking.FIVE_FIVE,
  FIVE_FIVE: TennisRanking.FIVE_FIVE,

  "6": TennisRanking.SIX_ZERO,
  "6.0": TennisRanking.SIX_ZERO,
  SIX_ZERO: TennisRanking.SIX_ZERO,

  "6.5": TennisRanking.SIX_FIVE,
  SIX_FIVE: TennisRanking.SIX_FIVE,

  "7": TennisRanking.SEVEN_ZERO,
  "7.0": TennisRanking.SEVEN_ZERO,
  SEVEN_ZERO: TennisRanking.SEVEN_ZERO,
} as const;

/**
 * All enum mappings combined for easy reference
 */
export const ALL_ENUM_MAPPINGS = {
  gender: GENDER_MAPPING,
  ageRange: AGE_RANGE_MAPPING,
  ethnicity: ETHNICITY_MAPPING,
  district: DISTRICT_MAPPING,
  tmacGearPreference: TMAC_GEAR_MAPPING,
  tennisRanking: TENNIS_RANKING_MAPPING,
} as const;

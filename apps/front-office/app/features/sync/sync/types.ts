// Types for the intake form CSV data
export interface IntakeFormRow {
  timestamp: string;
  approved: string;
  gender: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  district: string;
  gearPreference: string;
  gearSize: string;
  playlistSong: string;
  whyJoin: string;
  referredBy: string;
  playsTennis: string;
  tennisRanking: string;
  favoriteTennisPlayer: string;
  instagram: string;
  emailAddress: string;
  genderDetailed: string;
  age: string;
  birthDate: string;
  ethnicity: string;
  birthdayCelebration: string;
  // Additional columns that may be present
  [key: string]: string;
}

// Mapping results
export type MappingResult<T> = {
  value: T | null;
  original: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
};

// Processed user data ready for database insertion
export interface ProcessedUserData {
  // User table fields (moved from tennisProfile)
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  approved: boolean;
  createdAt: Date | null;

  // TennisProfile fields
  gender: string | null;
  ageRange: string | null;
  ethnicity: string | null;
  birthDate: Date | null;
  instagramHandle: string | null;
  district: string | null;
  districtOther: string | null;
  tmacGearPreference: string | null;
  tmacGearOther: string | null;
  gearSize: string | null;
  playlistSong: string | null;
  whyJoinTmac: string | null;
  referredBy: string | null;
  tennisRanking: string | null;
  favoriteTennisPlayer: string | null;

  // Metadata
  originalRow: IntakeFormRow;
  processingNotes: string[];
}

import type { ActionFunctionArgs } from "react-router";
import prisma from "~/config/prisma";
import {
  IntakeFormSubmissionSchema,
  type IntakeFormSubmission,
} from "../validation/intake-schema";
import type {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "~/generated/prisma/client";

/**
 * POST /api/intake/submit
 * Receives form submission from Google Apps Script and creates/updates user
 */
export async function action({ request }: ActionFunctionArgs) {
  // Validate API token
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.INTAKE_API_TOKEN) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const formData = IntakeFormSubmissionSchema.parse(body);

    // Transform and clean data
    const processedData = processFormData(formData);

    // Upsert user and tennis profile
    const result = await upsertUserWithProfile(processedData);

    return new Response(
      JSON.stringify({
        success: true,
        action: result.action,
        userId: result.userId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing intake submission:", error);

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Data transformation and cleaning functions

interface ProcessedUserData {
  // User fields
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  approved: boolean;
  createdAt: Date;

  // Tennis Profile fields
  gender: Gender | null;
  ageRange: AgeRange | null;
  ethnicity: Ethnicity | null;
  birthDate: Date | null;
  instagramHandle: string | null;
  district: District | null;
  districtOther: string | null;
  tmacGearPreference: TmacGearPreference | null;
  tmacGearOther: string | null;
  gearSize: GearSize | null;
  playlistSong: string | null;
  whyJoinTmac: string | null;
  referredBy: string | null;
  tennisRanking: TennisRanking | null;
  favoriteTennisPlayer: string | null;
}

function processFormData(formData: IntakeFormSubmission): ProcessedUserData {
  // Clean basic fields
  const firstName = cleanName(formData["What is your first name?"]);
  const lastName = cleanName(formData["What is your last name?"]);
  const email =
    cleanEmail(formData.Email) || cleanEmail(formData["Email Address"]);
  const phone = cleanPhone(formData["Phone Number (WhatsApp)"]);

  if (!email) {
    throw new Error("Valid email is required");
  }

  if (!firstName) {
    throw new Error("First name is required");
  }

  // Parse timestamp
  const createdAt = parseTimestamp(formData.Timestamp);

  // Parse approved status
  const approved = parseBoolean(formData.Approved);

  // Map enums
  const gender = mapGender(
    formData["Which most closely describes your gender?"] || formData.Gender
  );
  const ageRange = mapAgeRange(formData.Age);
  const ethnicity = mapEthnicity(formData.Ethnicity);
  const district = mapDistrict(formData["What district do you live in?"]);
  const gearPreference = mapGearPreference(
    formData["What's the first piece of TMAC gear we should launch?"]
  );
  const gearSize = mapGearSize(formData["What size are you?"]);
  const tennisRanking = mapTennisRanking(
    formData["What is your Tennis Ranking?"]
  );

  // Parse birth date
  const birthDate = parseBirthDate(formData["Birth Date"]);

  // Clean text fields
  const instagramHandle = cleanInstagramHandle(
    formData["What is your Instagram?"]
  );
  const playlistSong = cleanText(
    formData["What song would you add to The Mission Athletic Club playlist?"],
    10000
  );
  const whyJoinTmac = cleanText(
    formData["Why do you wanna join The Mission Athletic Club?"]
  );
  const referredBy = cleanText(formData["Who referred you?"], 10000);
  const favoriteTennisPlayer = cleanText(
    formData["Who is your favorite Tennis player?"],
    10000
  );

  // Handle district other
  let districtOther: string | null = null;
  if (district === "Other" && formData["What district do you live in?"]) {
    districtOther = cleanText(formData["What district do you live in?"], 10000);
  }

  // Handle gear other
  let tmacGearOther: string | null = null;
  if (
    gearPreference === "Other" &&
    formData["What's the first piece of TMAC gear we should launch?"]
  ) {
    tmacGearOther = cleanText(
      formData["What's the first piece of TMAC gear we should launch?"],
      10000
    );
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    approved,
    createdAt,
    gender,
    ageRange,
    ethnicity,
    birthDate,
    instagramHandle,
    district,
    districtOther,
    tmacGearPreference: gearPreference,
    tmacGearOther,
    gearSize,
    playlistSong,
    whyJoinTmac,
    referredBy,
    tennisRanking,
    favoriteTennisPlayer,
  };
}

async function upsertUserWithProfile(
  userData: ProcessedUserData
): Promise<{ action: "created" | "updated"; userId: string }> {
  // Check if user exists to determine action
  const existingUser = await prisma.user.findFirst({
    where: { email: userData.email },
  });

  const action: "created" | "updated" = existingUser ? "updated" : "created";

  // Upsert user and tennis profile in transaction
  const user = await prisma.$transaction(async tx => {
    // Upsert user
    const upsertedUser = await tx.user.upsert({
      where: { email: userData.email },
      create: {
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        emailVerified: false,
        approved: userData.approved,
        createdAt: userData.createdAt,
      },
      update: {
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        approved: userData.approved,
      },
    });

    // Upsert tennis profile
    await tx.tennisProfile.upsert({
      where: { userId: upsertedUser.id },
      create: {
        userId: upsertedUser.id,
        gender: userData.gender,
        ageRange: userData.ageRange,
        ethnicity: userData.ethnicity,
        birthDate: userData.birthDate,
        instagramHandle: userData.instagramHandle,
        district: userData.district,
        districtOther: userData.districtOther,
        tmacGearPreference: userData.tmacGearPreference,
        tmacGearOther: userData.tmacGearOther,
        gearSize: userData.gearSize,
        playlistSong: userData.playlistSong,
        whyJoinTmac: userData.whyJoinTmac,
        referredBy: userData.referredBy,
        tennisRanking: userData.tennisRanking,
        favoriteTennisPlayer: userData.favoriteTennisPlayer,
      },
      update: {
        gender: userData.gender,
        ageRange: userData.ageRange,
        ethnicity: userData.ethnicity,
        birthDate: userData.birthDate,
        instagramHandle: userData.instagramHandle,
        district: userData.district,
        districtOther: userData.districtOther,
        tmacGearPreference: userData.tmacGearPreference,
        tmacGearOther: userData.tmacGearOther,
        gearSize: userData.gearSize,
        playlistSong: userData.playlistSong,
        whyJoinTmac: userData.whyJoinTmac,
        referredBy: userData.referredBy,
        tennisRanking: userData.tennisRanking,
        favoriteTennisPlayer: userData.favoriteTennisPlayer,
      },
    });

    return upsertedUser;
  });

  return { action, userId: user.id };
}

// Utility functions for data cleaning and mapping

function cleanName(value: string | undefined): string | null {
  if (!value) return null;
  return value.trim() || null;
}

function cleanEmail(value: string | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  return cleaned.includes("@") ? cleaned : null;
}

function cleanPhone(value: string | undefined): string | null {
  if (!value) return null;
  // Remove all non-numeric characters except +
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned || null;
}

function cleanInstagramHandle(value: string | undefined): string | null {
  if (!value) return null;
  let cleaned = value.trim();
  // Remove @ if present
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }
  // Truncate to 50 chars
  return cleaned.slice(0, 50) || null;
}

function cleanText(
  value: string | undefined,
  maxLength: number = 255
): string | null {
  if (!value) return null;
  const cleaned = value.trim();
  return cleaned.slice(0, maxLength) || null;
}

function parseTimestamp(value: string | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === "true" || normalized === "yes" || normalized === "1";
}

function parseBirthDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Enum mapping functions

function mapGender(value: string | undefined): Gender | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  if (["m", "man", "male"].includes(normalized)) return "Man";
  if (["f", "woman", "female"].includes(normalized)) return "Woman";
  if (["they/them", "non-binary", "nonbinary"].includes(normalized))
    return "NonBinary";
  if (["prefer not to state", ""].includes(normalized))
    return "PreferNotToState";

  return "Other";
}

function mapAgeRange(value: string | undefined): AgeRange | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  if (normalized.includes("18-25")) return "EIGHTEEN_TO_TWENTY_FIVE";
  if (normalized.includes("26-35")) return "TWENTY_SIX_TO_THIRTY_FIVE";
  if (normalized.includes("36-45")) return "THIRTY_SIX_TO_FORTY_FIVE";
  if (normalized.includes("46-55")) return "FORTY_SIX_TO_FIFTY_FIVE";
  if (normalized.includes("55+") || normalized.includes("55 plus"))
    return "FIFTY_FIVE_PLUS";

  // Try to parse as number
  const age = parseInt(normalized);
  if (!isNaN(age)) {
    if (age >= 18 && age <= 25) return "EIGHTEEN_TO_TWENTY_FIVE";
    if (age >= 26 && age <= 35) return "TWENTY_SIX_TO_THIRTY_FIVE";
    if (age >= 36 && age <= 45) return "THIRTY_SIX_TO_FORTY_FIVE";
    if (age >= 46 && age <= 55) return "FORTY_SIX_TO_FIFTY_FIVE";
    if (age > 55) return "FIFTY_FIVE_PLUS";
  }

  return null;
}

function mapEthnicity(value: string | undefined): Ethnicity | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  if (
    ["american indian", "alaska native", "native american"].some(k =>
      normalized.includes(k)
    )
  )
    return "AmericanIndianOrAlaskaNative";
  if (
    ["pacific islander", "hawaiian", "samoan"].some(k => normalized.includes(k))
  )
    return "PacificIslander";
  if (
    ["black", "african american", "african-american"].some(k =>
      normalized.includes(k)
    )
  )
    return "BlackOrAfricanAmerican";
  if (["white", "caucasian"].some(k => normalized.includes(k))) return "White";
  if (["arab", "middle eastern", "persian"].some(k => normalized.includes(k)))
    return "Arab";
  if (
    ["asian", "chinese", "japanese", "korean", "indian"].some(k =>
      normalized.includes(k)
    )
  )
    return "Asian";
  if (
    ["hispanic", "latino", "latina", "latinx"].some(k => normalized.includes(k))
  )
    return "HispanicOrLatinx";
  if (["mixed", "multiracial", "biracial"].some(k => normalized.includes(k)))
    return "MixedRace";

  return "Other";
}

function mapDistrict(value: string | undefined): District | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  // Match district numbers
  const match = normalized.match(/district\s*(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 11) {
      return `District${num}` as District;
    }
  }

  // Check for specific neighborhoods that map to "Other"
  const otherLocations = [
    "marina",
    "oakland",
    "berkeley",
    "east bay",
    "south bay",
    "marin",
  ];
  if (otherLocations.some(loc => normalized.includes(loc))) {
    return "Other";
  }

  return "Other";
}

function mapGearPreference(
  value: string | undefined
): TmacGearPreference | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  if (["hat", "cap", "visor"].some(k => normalized.includes(k))) return "Hat";
  if (normalized.includes("sock")) return "Socks";
  if (["shirt", "tee", "top"].some(k => normalized.includes(k))) return "Shirt";

  return "Other";
}

function mapGearSize(value: string | undefined): GearSize | null {
  if (!value) return null;
  const normalized = value.toUpperCase().trim();

  const validSizes: GearSize[] = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
  ];
  if (validSizes.includes(normalized as GearSize)) {
    return normalized as GearSize;
  }

  // Handle variations
  if (["EXTRA SMALL", "X-SMALL"].includes(normalized)) return "XS";
  if (normalized === "SMALL") return "S";
  if (normalized === "MEDIUM") return "M";
  if (normalized === "LARGE") return "L";
  if (["EXTRA LARGE", "X-LARGE"].includes(normalized)) return "XL";

  return null;
}

function mapTennisRanking(value: string | undefined): TennisRanking | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  const numValue = parseFloat(normalized);
  if (!isNaN(numValue)) {
    if (numValue >= 1.0 && numValue < 1.5) return "ONE_ZERO";
    if (numValue >= 1.5 && numValue < 2.0) return "ONE_FIVE";
    if (numValue >= 2.0 && numValue < 2.5) return "TWO_ZERO";
    if (numValue >= 2.5 && numValue < 3.0) return "TWO_FIVE";
    if (numValue >= 3.0 && numValue < 3.5) return "THREE_ZERO";
    if (numValue >= 3.5 && numValue < 4.0) return "THREE_FIVE";
    if (numValue >= 4.0 && numValue < 4.5) return "FOUR_ZERO";
    if (numValue >= 4.5 && numValue < 5.0) return "FOUR_FIVE";
    if (numValue >= 5.0 && numValue < 5.5) return "FIVE_ZERO";
    if (numValue >= 5.5 && numValue < 6.0) return "FIVE_FIVE";
    if (numValue >= 6.0 && numValue < 6.5) return "SIX_ZERO";
    if (numValue >= 6.5 && numValue < 7.0) return "SIX_FIVE";
    if (numValue >= 7.0) return "SEVEN_ZERO";
  }

  return null;
}

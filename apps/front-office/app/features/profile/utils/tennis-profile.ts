import { z } from "zod";
import {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "~/generated/prisma/enums";

// Validation schema for tennis profile form
export const tennisProfileSchema = z.object({
  // Contact info fields for guest profiles
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less")
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional(),

  // Tennis profile fields
  gender: z.nativeEnum(Gender).optional(),
  ageRange: z.nativeEnum(AgeRange).optional(),
  ethnicity: z.nativeEnum(Ethnicity).optional(),
  birthDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
      },
      {
        message: "Birth date must be a valid date and not in the future",
      }
    ),
  instagramHandle: z
    .string()
    .max(50, "Instagram handle must be 50 characters or less")
    .optional()
    .refine(
      (handle) => {
        if (!handle) return true;
        // Remove @ if present at the beginning
        const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
        // Instagram username pattern: letters, numbers, underscores, dots
        return /^[a-zA-Z0-9_.]+$/.test(cleanHandle);
      },
      {
        message:
          "Instagram handle can only contain letters, numbers, underscores, and dots",
      }
    ),
  district: z.nativeEnum(District).optional(),
  districtOther: z
    .string()
    .max(100, "District location must be 100 characters or less")
    .optional(),
  tmacGearPreference: z.nativeEnum(TmacGearPreference).optional(),
  tmacGearOther: z
    .string()
    .max(100, "Gear description must be 100 characters or less")
    .optional(),
  gearSize: z.nativeEnum(GearSize).optional(),
  playlistSong: z
    .string()
    .max(200, "Song suggestion must be 200 characters or less")
    .optional(),
  whyJoinTmac: z
    .string()
    .max(500, "Response must be 500 characters or less")
    .optional(),
  referredBy: z
    .string()
    .max(100, "Referrer name must be 100 characters or less")
    .optional(),
  tennisRanking: z.nativeEnum(TennisRanking).optional(),
  favoriteTennisPlayer: z
    .string()
    .max(100, "Player name must be 100 characters or less")
    .optional(),
});

// Validation schema for partial updates (auto-save)
export const tennisProfilePartialSchema = tennisProfileSchema.partial();

// Validation schema for guest profile creation (requires contact info)
export const guestTennisProfileSchema = tennisProfileSchema.extend({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z.string().email("Please enter a valid email address"),
});

export type TennisProfileSchemaType = z.infer<typeof tennisProfileSchema>;
export type GuestTennisProfileSchemaType = z.infer<
  typeof guestTennisProfileSchema
>;

// Helper function to validate individual fields
export function validateField(
  fieldName: keyof TennisProfileSchemaType,
  value: any
): { isValid: boolean; error?: string } {
  try {
    const fieldSchema = tennisProfileSchema.shape[fieldName];
    fieldSchema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "Invalid value",
      };
    }
    return { isValid: false, error: "Validation error" };
  }
}

// Helper function to check conditional field requirements
export function checkConditionalRequirements(
  data: Partial<TennisProfileSchemaType>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // If district is "Other", districtOther should be provided
  if (data.district === District.Other && !data.districtOther?.trim()) {
    errors.push("Please specify your district location when selecting 'Other'");
  }

  // If tmacGearPreference is "Other", tmacGearOther should be provided
  if (
    data.tmacGearPreference === TmacGearPreference.Other &&
    !data.tmacGearOther?.trim()
  ) {
    errors.push("Please specify your gear preference when selecting 'Other'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

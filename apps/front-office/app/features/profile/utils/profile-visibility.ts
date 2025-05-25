import type {
  TennisProfile,
  TennisProfileFormData,
} from "~/features/profile/types/tennis-profile";

// Define which fields are considered PII (Personally Identifiable Information)
export const PII_FIELDS: (keyof TennisProfileFormData)[] = [
  "gender",
  "ageRange",
  "ethnicity",
  "birthDate",
];

// Define which fields are community visible
export const COMMUNITY_VISIBLE_FIELDS: (keyof TennisProfileFormData)[] = [
  "instagramHandle",
  "district",
  "districtOther",
  "tennisRanking",
  "favoriteTennisPlayer",
];

// Define which fields are preferences/internal use
export const PREFERENCE_FIELDS: (keyof TennisProfileFormData)[] = [
  "tmacGearPreference",
  "tmacGearOther",
  "gearSize",
  "playlistSong",
  "whyJoinTmac",
  "referredBy",
];

// All profile fields for completeness checking
export const ALL_PROFILE_FIELDS: (keyof TennisProfileFormData)[] = [
  ...PII_FIELDS,
  ...COMMUNITY_VISIBLE_FIELDS,
  ...PREFERENCE_FIELDS,
];

// Helper function to determine field visibility
export function getFieldVisibility(
  fieldName: keyof TennisProfileFormData
): "private" | "community" | "preference" {
  if (PII_FIELDS.includes(fieldName)) return "private";
  if (COMMUNITY_VISIBLE_FIELDS.includes(fieldName)) return "community";
  return "preference";
}

// Helper function to get visible profile data for community
export function getCommunityVisibleProfile(
  profile: TennisProfile | null
): Partial<TennisProfile> {
  if (!profile) return {};

  const visibleData: Partial<TennisProfile> = {};

  COMMUNITY_VISIBLE_FIELDS.forEach((field) => {
    if (profile[field] !== null && profile[field] !== undefined) {
      // @ts-expect-error - TypeScript can't infer the field type dynamically
      visibleData[field] = profile[field];
    }
  });

  return visibleData;
}

/**
 * Remove PII fields from a tennis profile for public display
 */
export function sanitizeProfileForPublic(
  profile: TennisProfile | null
): Partial<TennisProfile> | null {
  if (!profile) return null;

  const sanitized: Partial<TennisProfile> = {
    id: profile.id,
    userId: profile.userId,
    instagramHandle: profile.instagramHandle,
    district: profile.district,
    districtOther: profile.districtOther,
    tennisRanking: profile.tennisRanking,
    favoriteTennisPlayer: profile.favoriteTennisPlayer,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  return sanitized;
}

/**
 * Get only community-visible fields from profile data
 */
export function getCommunityVisibleFields(
  profile: TennisProfile | null
): Record<string, any> {
  if (!profile) return {};

  const visibleData: Record<string, any> = {};

  COMMUNITY_VISIBLE_FIELDS.forEach((field) => {
    if (
      profile[field as keyof TennisProfile] !== null &&
      profile[field as keyof TennisProfile] !== undefined
    ) {
      visibleData[field] = profile[field as keyof TennisProfile];
    }
  });

  return visibleData;
}

/**
 * Get only PII fields from profile data (for user's own view)
 */
export function getPIIFields(
  profile: TennisProfile | null
): Record<string, any> {
  if (!profile) return {};

  const piiData: Record<string, any> = {};

  PII_FIELDS.forEach((field) => {
    if (
      profile[field as keyof TennisProfile] !== null &&
      profile[field as keyof TennisProfile] !== undefined
    ) {
      piiData[field] = profile[field as keyof TennisProfile];
    }
  });

  return piiData;
}

/**
 * Check if a field should be visible to the community
 */
export function isFieldCommunityVisible(
  fieldName: keyof TennisProfileFormData
): boolean {
  return COMMUNITY_VISIBLE_FIELDS.includes(fieldName);
}

/**
 * Check if a field contains PII
 */
export function isFieldPII(fieldName: keyof TennisProfileFormData): boolean {
  return PII_FIELDS.includes(fieldName);
}

/**
 * Check if a field is a preference field
 */
export function isFieldPreference(
  fieldName: keyof TennisProfileFormData
): boolean {
  return PREFERENCE_FIELDS.includes(fieldName);
}

/**
 * Validate that an update request doesn't expose PII in unauthorized contexts
 */
export function validateProfileUpdatePermissions(
  updateData: Partial<TennisProfileFormData>,
  isOwner: boolean
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Only the profile owner can update PII fields
  if (!isOwner) {
    const hasPIIFields = Object.keys(updateData).some((field) =>
      isFieldPII(field as keyof TennisProfileFormData)
    );

    if (hasPIIFields) {
      errors.push("You can only update your own personal information");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Filter profile data based on viewer's relationship to the profile owner
 */
export function filterProfileDataByViewer(
  profile: TennisProfile | null,
  viewerUserId: string,
  profileOwnerUserId: string
): Partial<TennisProfile> | null {
  if (!profile) return null;

  // If viewer is the profile owner, they can see everything
  if (viewerUserId === profileOwnerUserId) {
    return profile;
  }

  // For other users, only show community-visible fields
  return sanitizeProfileForPublic(profile);
}

/**
 * Get field visibility metadata for UI rendering
 */
export function getFieldVisibilityInfo(
  fieldName: keyof TennisProfileFormData
): {
  isVisible: boolean;
  visibilityLevel: "private" | "community" | "preference";
  description: string;
} {
  if (isFieldPII(fieldName)) {
    return {
      isVisible: false,
      visibilityLevel: "private",
      description: "Private - only visible to you",
    };
  }

  if (isFieldCommunityVisible(fieldName)) {
    return {
      isVisible: true,
      visibilityLevel: "community",
      description: "Community visible - other members can see this",
    };
  }

  return {
    isVisible: false,
    visibilityLevel: "preference",
    description: "Internal use - helps us improve your experience",
  };
}

/**
 * Create a public profile summary for community features
 */
export function createPublicProfileSummary(
  profile: TennisProfile | null,
  user: { name: string; firstName?: string }
): {
  name: string;
  tennisRanking?: string;
  district?: string;
  instagramHandle?: string;
  favoriteTennisPlayer?: string;
} | null {
  if (!profile) return null;

  return {
    name: user.firstName || user.name,
    tennisRanking: profile.tennisRanking || undefined,
    district:
      profile.district === "Other"
        ? profile.districtOther || "Other"
        : profile.district || undefined,
    instagramHandle: profile.instagramHandle || undefined,
    favoriteTennisPlayer: profile.favoriteTennisPlayer || undefined,
  };
}

import prisma from "~/lib/prisma";
import type { TennisProfile } from "~/generated/prisma/client";
import type { TennisProfileFormData } from "~/features/profile/types/tennis-profile";

export interface TennisProfileService {
  getTennisProfile(userId: string): Promise<TennisProfile | null>;
  getTennisProfileByEmail(email: string): Promise<TennisProfile | null>;
  createTennisProfile(
    userId: string,
    data: TennisProfileFormData
  ): Promise<TennisProfile>;
  createGuestTennisProfile(data: TennisProfileFormData): Promise<TennisProfile>;
  linkGuestProfileToUser(
    email: string,
    userId: string
  ): Promise<TennisProfile | null>;
  updateTennisProfile(
    userId: string,
    data: Partial<TennisProfileFormData>
  ): Promise<TennisProfile>;
  deleteTennisProfile(userId: string): Promise<void>;
  getProfileCompletionStatus(userId: string): Promise<ProfileCompletionStatus>;
  updateReminderTimestamp(userId: string): Promise<void>;
  shouldShowProfileReminder(userId: string): Promise<boolean>;
}

interface ProfileCompletionStatus {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  completionPercentage: number;
  missingFields: (keyof TennisProfileFormData)[];
}

export const tennisProfileService: TennisProfileService = {
  async getTennisProfile(userId: string): Promise<TennisProfile | null> {
    try {
      return await prisma.tennisProfile.findUnique({
        where: { userId },
      });
    } catch (error) {
      console.error("Error fetching tennis profile:", error);
      throw new Error("Failed to fetch tennis profile");
    }
  },

  async getTennisProfileByEmail(email: string): Promise<TennisProfile | null> {
    try {
      return await prisma.tennisProfile.findFirst({
        where: {
          email: email.toLowerCase(),
          userId: null, // Only find guest profiles
        },
      });
    } catch (error) {
      console.error("Error fetching tennis profile by email:", error);
      throw new Error("Failed to fetch tennis profile by email");
    }
  },

  async createTennisProfile(
    userId: string,
    data: TennisProfileFormData
  ): Promise<TennisProfile> {
    try {
      const profileData = {
        userId,
        // Contact info fields (backup when userId is present)
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone || null,
        // Tennis profile fields
        gender: data.gender || null,
        ageRange: data.ageRange || null,
        ethnicity: data.ethnicity || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        instagramHandle: data.instagramHandle || null,
        district: data.district || null,
        districtOther: data.districtOther || null,
        tmacGearPreference: data.tmacGearPreference || null,
        tmacGearOther: data.tmacGearOther || null,
        gearSize: data.gearSize || null,
        playlistSong: data.playlistSong || null,
        whyJoinTmac: data.whyJoinTmac || null,
        referredBy: data.referredBy || null,
        tennisRanking: data.tennisRanking || null,
        favoriteTennisPlayer: data.favoriteTennisPlayer || null,
      };

      return await prisma.tennisProfile.create({
        data: profileData,
      });
    } catch (error) {
      console.error("Error creating tennis profile:", error);
      throw new Error("Failed to create tennis profile");
    }
  },

  async createGuestTennisProfile(
    data: TennisProfileFormData
  ): Promise<TennisProfile> {
    try {
      const profileData = {
        userId: null, // No userId for guest profiles
        // Contact info fields (authoritative when userId is null)
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone || null,
        // Tennis profile fields
        gender: data.gender || null,
        ageRange: data.ageRange || null,
        ethnicity: data.ethnicity || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        instagramHandle: data.instagramHandle || null,
        district: data.district || null,
        districtOther: data.districtOther || null,
        tmacGearPreference: data.tmacGearPreference || null,
        tmacGearOther: data.tmacGearOther || null,
        gearSize: data.gearSize || null,
        playlistSong: data.playlistSong || null,
        whyJoinTmac: data.whyJoinTmac || null,
        referredBy: data.referredBy || null,
        tennisRanking: data.tennisRanking || null,
        favoriteTennisPlayer: data.favoriteTennisPlayer || null,
      };

      return await prisma.tennisProfile.create({
        data: profileData,
      });
    } catch (error) {
      console.error("Error creating guest tennis profile:", error);
      throw new Error("Failed to create guest tennis profile");
    }
  },

  async linkGuestProfileToUser(
    email: string,
    userId: string
  ): Promise<TennisProfile | null> {
    try {
      // Find the guest profile by email
      const guestProfile = await this.getTennisProfileByEmail(email);

      if (!guestProfile) {
        return null; // No guest profile found
      }

      // Update the profile to link it to the user
      const linkedProfile = await prisma.tennisProfile.update({
        where: { id: guestProfile.id },
        data: { userId },
      });

      return linkedProfile;
    } catch (error) {
      console.error("Error linking guest profile to user:", error);
      throw new Error("Failed to link guest profile to user");
    }
  },

  async updateTennisProfile(
    userId: string,
    data: Partial<TennisProfileFormData>
  ): Promise<TennisProfile> {
    try {
      const updateData: any = {};

      // Only include fields that are defined in the update data
      // Contact info fields
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;

      // Tennis profile fields
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.ageRange !== undefined) updateData.ageRange = data.ageRange;
      if (data.ethnicity !== undefined) updateData.ethnicity = data.ethnicity;
      if (data.birthDate !== undefined) {
        updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      }
      if (data.instagramHandle !== undefined)
        updateData.instagramHandle = data.instagramHandle;
      if (data.district !== undefined) updateData.district = data.district;
      if (data.districtOther !== undefined)
        updateData.districtOther = data.districtOther;
      if (data.tmacGearPreference !== undefined)
        updateData.tmacGearPreference = data.tmacGearPreference;
      if (data.tmacGearOther !== undefined)
        updateData.tmacGearOther = data.tmacGearOther;
      if (data.gearSize !== undefined) updateData.gearSize = data.gearSize;
      if (data.playlistSong !== undefined)
        updateData.playlistSong = data.playlistSong;
      if (data.whyJoinTmac !== undefined)
        updateData.whyJoinTmac = data.whyJoinTmac;
      if (data.referredBy !== undefined)
        updateData.referredBy = data.referredBy;
      if (data.tennisRanking !== undefined)
        updateData.tennisRanking = data.tennisRanking;
      if (data.favoriteTennisPlayer !== undefined)
        updateData.favoriteTennisPlayer = data.favoriteTennisPlayer;

      return await prisma.tennisProfile.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          ...updateData,
        },
      });
    } catch (error) {
      console.error("Error updating tennis profile:", error);
      throw new Error("Failed to update tennis profile");
    }
  },

  async deleteTennisProfile(userId: string): Promise<void> {
    try {
      await prisma.tennisProfile.delete({
        where: { userId },
      });
    } catch (error) {
      console.error("Error deleting tennis profile:", error);
      throw new Error("Failed to delete tennis profile");
    }
  },

  async getProfileCompletionStatus(
    userId: string
  ): Promise<ProfileCompletionStatus> {
    try {
      const profile = await this.getTennisProfile(userId);

      if (!profile) {
        return {
          isComplete: false,
          completedFields: 0,
          totalFields: 15, // Total number of profile fields
          completionPercentage: 0,
          missingFields: [
            "gender",
            "ageRange",
            "ethnicity",
            "birthDate",
            "instagramHandle",
            "district",
            "tmacGearPreference",
            "gearSize",
            "playlistSong",
            "whyJoinTmac",
            "referredBy",
            "tennisRanking",
            "favoriteTennisPlayer",
          ],
        };
      }

      const fields: (keyof TennisProfileFormData)[] = [
        "gender",
        "ageRange",
        "ethnicity",
        "birthDate",
        "instagramHandle",
        "district",
        "tmacGearPreference",
        "gearSize",
        "playlistSong",
        "whyJoinTmac",
        "referredBy",
        "tennisRanking",
        "favoriteTennisPlayer",
      ];

      const missingFields: (keyof TennisProfileFormData)[] = [];
      let completedFields = 0;

      for (const field of fields) {
        const value = profile[field as keyof TennisProfile];
        if (value !== null && value !== undefined && value !== "") {
          completedFields++;
        } else {
          missingFields.push(field);
        }
      }

      // Special handling for districtOther - only required if district is "Other"
      if (profile.district === "Other") {
        if (!profile.districtOther) {
          missingFields.push("districtOther");
        } else {
          completedFields++;
        }
      }

      // Special handling for tmacGearOther - only required if tmacGearPreference is "Other"
      if (profile.tmacGearPreference === "Other") {
        if (!profile.tmacGearOther) {
          missingFields.push("tmacGearOther");
        } else {
          completedFields++;
        }
      }

      const totalFields =
        fields.length +
        (profile.district === "Other" ? 1 : 0) +
        (profile.tmacGearPreference === "Other" ? 1 : 0);

      const completionPercentage = Math.round(
        (completedFields / totalFields) * 100
      );
      const isComplete = completionPercentage >= 70; // Consider 70% as "complete"

      return {
        isComplete,
        completedFields,
        totalFields,
        completionPercentage,
        missingFields,
      };
    } catch (error) {
      console.error("Error getting profile completion status:", error);
      throw new Error("Failed to get profile completion status");
    }
  },

  async updateReminderTimestamp(userId: string): Promise<void> {
    try {
      await prisma.tennisProfile.upsert({
        where: { userId },
        update: { lastReminderAt: new Date() },
        create: {
          userId,
          lastReminderAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error updating reminder timestamp:", error);
      throw new Error("Failed to update reminder timestamp");
    }
  },

  async shouldShowProfileReminder(userId: string): Promise<boolean> {
    try {
      const completionStatus = await this.getProfileCompletionStatus(userId);

      // Don't show reminder if profile is complete
      if (completionStatus.isComplete) {
        return false;
      }

      const profile = await this.getTennisProfile(userId);

      // Show reminder if no profile exists or no lastReminderAt
      if (!profile || !profile.lastReminderAt) {
        return true;
      }

      // Show reminder if it's been 2 weeks (14 days) since last reminder
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      return profile.lastReminderAt < twoWeeksAgo;
    } catch (error) {
      console.error("Error checking profile reminder:", error);
      return false; // Default to not showing reminder on error
    }
  },
};

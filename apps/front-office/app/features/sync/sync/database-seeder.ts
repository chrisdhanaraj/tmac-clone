import prisma from "~/config/prisma";
import type { ProcessedUserData } from "./types";
import { logger } from "@tmac/shared/logger";
import {
  Gender,
  AgeRange,
  Ethnicity,
  District,
  TmacGearPreference,
  GearSize,
  TennisRanking,
} from "~/generated/prisma/client";

export class DatabaseSeeder {
  async seedUsers(processedData: ProcessedUserData[]): Promise<{
    created: number;
    updated: number;
    errors: { email: string; error: string }[];
  }> {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as { email: string; error: string }[],
    };

    for (const userData of processedData) {
      try {
        const wasUpdated = await this.upsertUserWithProfile(userData);
        if (wasUpdated) {
          results.updated++;
          logger.info(
            `↻ Updated user: ${userData.firstName} ${userData.lastName} (${userData.email})`
          );
        } else {
          results.created++;
          logger.info(
            `✓ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          email: userData.email,
          error: errorMessage,
        });
        logger.error(
          `✗ Error upserting user ${userData.email}: ${errorMessage}`
        );
      }
    }

    return results;
  }

  private async upsertUserWithProfile(
    userData: ProcessedUserData
  ): Promise<boolean> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
      include: {
        tennisProfile: true,
      },
    });

    // Validate data lengths before insertion/update
    this.validateDataLengths(userData);

    // Update or create user and tennis profile in a transaction
    await prisma.$transaction(async tx => {
      try {
        if (existingUser) {
          // Update existing user
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: `${userData.firstName || ""} ${
                userData.lastName || ""
              }`.trim(),
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              emailVerified: userData.emailVerified,
              approved: userData.approved,
              // Don't update createdAt for existing users
            },
          });

          // Update or create tennis profile
          if (existingUser.tennisProfile) {
            await tx.tennisProfile.update({
              where: { userId: existingUser.id },
              data: {
                gender: userData.gender as unknown as Gender,
                ageRange: userData.ageRange as unknown as AgeRange,
                ethnicity: userData.ethnicity as unknown as Ethnicity,
                birthDate: userData.birthDate,
                instagramHandle: userData.instagramHandle,
                district: userData.district as unknown as District,
                districtOther: userData.districtOther,
                tmacGearPreference:
                  userData.tmacGearPreference as unknown as TmacGearPreference,
                tmacGearOther: userData.tmacGearOther,
                gearSize: userData.gearSize as unknown as GearSize,
                playlistSong: userData.playlistSong,
                whyJoinTmac: userData.whyJoinTmac,
                referredBy: userData.referredBy,
                tennisRanking:
                  userData.tennisRanking as unknown as TennisRanking,
                favoriteTennisPlayer: userData.favoriteTennisPlayer,
              },
            });
          } else {
            await tx.tennisProfile.create({
              data: {
                userId: existingUser.id,
                gender: userData.gender as unknown as Gender,
                ageRange: userData.ageRange as unknown as AgeRange,
                ethnicity: userData.ethnicity as unknown as Ethnicity,
                birthDate: userData.birthDate,
                instagramHandle: userData.instagramHandle,
                district: userData.district as unknown as District,
                districtOther: userData.districtOther,
                tmacGearPreference:
                  userData.tmacGearPreference as unknown as TmacGearPreference,
                tmacGearOther: userData.tmacGearOther,
                gearSize: userData.gearSize as unknown as GearSize,
                playlistSong: userData.playlistSong,
                whyJoinTmac: userData.whyJoinTmac,
                referredBy: userData.referredBy,
                tennisRanking:
                  userData.tennisRanking as unknown as TennisRanking,
                favoriteTennisPlayer: userData.favoriteTennisPlayer,
              },
            });
          }
        } else {
          // Create new user
          const user = await tx.user.create({
            data: {
              name: `${userData.firstName || ""} ${
                userData.lastName || ""
              }`.trim(),
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phone: userData.phone,
              emailVerified: userData.emailVerified,
              approved: userData.approved,
              createdAt: userData.createdAt || new Date(),
            },
          });

          // Create tennis profile
          await tx.tennisProfile.create({
            data: {
              userId: user.id,
              gender: userData.gender as unknown as Gender,
              ageRange: userData.ageRange as unknown as AgeRange,
              ethnicity: userData.ethnicity as unknown as Ethnicity,
              birthDate: userData.birthDate,
              instagramHandle: userData.instagramHandle,
              district: userData.district as unknown as District,
              districtOther: userData.districtOther,
              tmacGearPreference:
                userData.tmacGearPreference as unknown as TmacGearPreference,
              tmacGearOther: userData.tmacGearOther,
              gearSize: userData.gearSize as unknown as GearSize,
              playlistSong: userData.playlistSong,
              whyJoinTmac: userData.whyJoinTmac,
              referredBy: userData.referredBy,
              tennisRanking: userData.tennisRanking as unknown as TennisRanking,
              favoriteTennisPlayer: userData.favoriteTennisPlayer,
            },
          });
        }
      } catch (error) {
        // Enhanced error handling with field details
        this.logDetailedError(error, userData);
        throw error;
      }
    });

    return !!existingUser;
  }

  private validateDataLengths(userData: ProcessedUserData): void {
    const validationErrors: string[] = [];

    // Define column length limits based on schema
    const limits = {
      instagramHandle: 50,
      districtOther: 10000,
      tmacGearOther: 10000,
      playlistSong: 10000,
      referredBy: 10000,
      favoriteTennisPlayer: 10000,
    };

    // Check each field with defined limits
    Object.entries(limits).forEach(([field, limit]) => {
      const value = userData[field as keyof ProcessedUserData] as string;
      if (value && value.length > limit) {
        validationErrors.push(
          `${field}: ${
            value.length
          } chars (limit: ${limit}) - "${value.substring(0, 100)}${
            value.length > 100 ? "..." : ""
          }"`
        );
      }
    });

    if (validationErrors.length > 0) {
      throw new Error(
        `Data length validation failed for ${
          userData.email
        }:\n${validationErrors.join("\n")}`
      );
    }
  }

  private logDetailedError(error: unknown, userData: ProcessedUserData): void {
    logger.error(`\n🚨 Detailed error for user: ${userData.email}`);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error message: ${errorMessage}`);

    // Log all field lengths for debugging
    logger.error(`\n📏 Field lengths:`);
    const fieldsToCheck = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      instagramHandle: userData.instagramHandle,
      districtOther: userData.districtOther,
      tmacGearOther: userData.tmacGearOther,
      playlistSong: userData.playlistSong,
      whyJoinTmac: userData.whyJoinTmac,
      referredBy: userData.referredBy,
      favoriteTennisPlayer: userData.favoriteTennisPlayer,
    };

    Object.entries(fieldsToCheck).forEach(([field, value]) => {
      if (value) {
        const length = value.length;
        const preview =
          value.length > 50 ? `${value.substring(0, 50)}...` : value;
        logger.error(`  ${field}: ${length} chars - "${preview}"`);
      }
    });

    // Log original CSV data for reference
    logger.error(`\n📋 Original CSV data:`);
    logger.error(`  First Name: "${userData.originalRow.firstName}"`);
    logger.error(`  Last Name: "${userData.originalRow.lastName}"`);
    logger.error(`  Email: "${userData.originalRow.email}"`);
    logger.error(`  Phone: "${userData.originalRow.phone}"`);
    logger.error(`  Instagram: "${userData.originalRow.instagram}"`);
    logger.error(`  District: "${userData.originalRow.district}"`);
    logger.error(`  Gear Preference: "${userData.originalRow.gearPreference}"`);
    logger.error(`  Playlist Song: "${userData.originalRow.playlistSong}"`);
    logger.error(`  Why Join: "${userData.originalRow.whyJoin}"`);
    logger.error(`  Referred By: "${userData.originalRow.referredBy}"`);
    logger.error(
      `  Favorite Player: "${userData.originalRow.favoriteTennisPlayer}"`
    );
  }

  async checkExistingUsers(emails: string[]): Promise<string[]> {
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        email: true,
      },
    });

    return existingUsers.map(user => user.email);
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalTennisProfiles: number;
  }> {
    const [totalUsers, totalTennisProfiles] = await Promise.all([
      prisma.user.count(),
      prisma.tennisProfile.count(),
    ]);

    return { totalUsers, totalTennisProfiles };
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

  // Utility method to safely truncate data if needed
  static truncateField(
    value: string | null,
    maxLength: number,
    fieldName: string
  ): string | null {
    if (!value) return value;

    if (value.length > maxLength) {
      logger.warn(
        `⚠️  Truncating ${fieldName} from ${value.length} to ${maxLength} characters`
      );
      return value.substring(0, maxLength);
    }

    return value;
  }
}

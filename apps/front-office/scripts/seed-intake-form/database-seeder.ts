import prisma from "../../app/config/prisma";
import type { ProcessedUserData } from "./types";

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
          console.log(
            `↻ Updated user: ${userData.firstName} ${userData.lastName} (${userData.email})`
          );
        } else {
          results.created++;
          console.log(
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
        console.error(
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
              firstName: userData.firstName!,
              lastName: userData.lastName!,
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
                gender: userData.gender as any,
                ageRange: userData.ageRange as any,
                ethnicity: userData.ethnicity as any,
                birthDate: userData.birthDate,
                instagramHandle: userData.instagramHandle,
                district: userData.district as any,
                districtOther: userData.districtOther,
                tmacGearPreference: userData.tmacGearPreference as any,
                tmacGearOther: userData.tmacGearOther,
                gearSize: userData.gearSize as any,
                playlistSong: userData.playlistSong,
                whyJoinTmac: userData.whyJoinTmac,
                referredBy: userData.referredBy,
                tennisRanking: userData.tennisRanking as any,
                favoriteTennisPlayer: userData.favoriteTennisPlayer,
              },
            });
          } else {
            await tx.tennisProfile.create({
              data: {
                userId: existingUser.id,
                gender: userData.gender as any,
                ageRange: userData.ageRange as any,
                ethnicity: userData.ethnicity as any,
                birthDate: userData.birthDate,
                instagramHandle: userData.instagramHandle,
                district: userData.district as any,
                districtOther: userData.districtOther,
                tmacGearPreference: userData.tmacGearPreference as any,
                tmacGearOther: userData.tmacGearOther,
                gearSize: userData.gearSize as any,
                playlistSong: userData.playlistSong,
                whyJoinTmac: userData.whyJoinTmac,
                referredBy: userData.referredBy,
                tennisRanking: userData.tennisRanking as any,
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
              firstName: userData.firstName!,
              lastName: userData.lastName!,
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
              gender: userData.gender as any,
              ageRange: userData.ageRange as any,
              ethnicity: userData.ethnicity as any,
              birthDate: userData.birthDate,
              instagramHandle: userData.instagramHandle,
              district: userData.district as any,
              districtOther: userData.districtOther,
              tmacGearPreference: userData.tmacGearPreference as any,
              tmacGearOther: userData.tmacGearOther,
              gearSize: userData.gearSize as any,
              playlistSong: userData.playlistSong,
              whyJoinTmac: userData.whyJoinTmac,
              referredBy: userData.referredBy,
              tennisRanking: userData.tennisRanking as any,
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

  private logDetailedError(error: any, userData: ProcessedUserData): void {
    console.error(`\n🚨 Detailed error for user: ${userData.email}`);
    console.error(`Error message: ${error.message}`);

    // Log all field lengths for debugging
    console.error(`\n📏 Field lengths:`);
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
        console.error(`  ${field}: ${length} chars - "${preview}"`);
      }
    });

    // Log original CSV data for reference
    console.error(`\n📋 Original CSV data:`);
    console.error(`  First Name: "${userData.originalRow.firstName}"`);
    console.error(`  Last Name: "${userData.originalRow.lastName}"`);
    console.error(`  Email: "${userData.originalRow.email}"`);
    console.error(`  Phone: "${userData.originalRow.phone}"`);
    console.error(`  Instagram: "${userData.originalRow.instagram}"`);
    console.error(`  District: "${userData.originalRow.district}"`);
    console.error(
      `  Gear Preference: "${userData.originalRow.gearPreference}"`
    );
    console.error(`  Playlist Song: "${userData.originalRow.playlistSong}"`);
    console.error(`  Why Join: "${userData.originalRow.whyJoin}"`);
    console.error(`  Referred By: "${userData.originalRow.referredBy}"`);
    console.error(
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
      console.warn(
        `⚠️  Truncating ${fieldName} from ${value.length} to ${maxLength} characters`
      );
      return value.substring(0, maxLength);
    }

    return value;
  }
}

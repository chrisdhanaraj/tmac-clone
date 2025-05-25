/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `access_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `booking_time_end` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_time_start` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `court_group` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `court_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `event_time_end` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `event_time_start` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `host_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `luma_id` on the `booking` table. All the data in the column will be lost.
  - The `status` column on the `booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `booking_duration` on the `court` table. All the data in the column will be lost.
  - You are about to drop the column `booking_style` on the `court` table. All the data in the column will be lost.
  - You are about to drop the column `location_id` on the `court` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `rec_user_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the `court_location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingTimeEnd` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingTimeStart` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courtLocationId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTimeEnd` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTimeStart` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingDuration` to the `court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingStyle` to the `court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "bookingStatus" AS ENUM ('draft', 'ready', 'complete', 'cancelled');

-- CreateEnum
CREATE TYPE "bookingStyle" AS ENUM ('seven_days_before_8am', 'two_days_before_noon');

-- CreateEnum
CREATE TYPE "bookingType" AS ENUM ('first_volleys', 'volley_and_vibes', 'vibras_and_voleas', 'feeder_session', 'tempo', 'starters', 'flow');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Woman', 'Man', 'NonBinary', 'Agender', 'PreferNotToState', 'Other');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('EIGHTEEN_TO_TWENTY_FIVE', 'TWENTY_SIX_TO_THIRTY_FIVE', 'THIRTY_SIX_TO_FORTY_FIVE', 'FORTY_SIX_TO_FIFTY_FIVE', 'FIFTY_FIVE_PLUS', 'PreferNotToState');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('AmericanIndianOrAlaskaNative', 'PacificIslander', 'BlackOrAfricanAmerican', 'White', 'Arab', 'Asian', 'HispanicOrLatinx', 'MixedRace', 'Other');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('District1', 'District2', 'District3', 'District4', 'District5', 'District6', 'District7', 'District8', 'District9', 'District10', 'District11', 'Other');

-- CreateEnum
CREATE TYPE "TmacGearPreference" AS ENUM ('Hat', 'Socks', 'Shirt', 'Other');

-- CreateEnum
CREATE TYPE "GearSize" AS ENUM ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- CreateEnum
CREATE TYPE "TennisRanking" AS ENUM ('ONE_ZERO', 'ONE_FIVE', 'TWO_ZERO', 'TWO_FIVE', 'THREE_ZERO', 'THREE_FIVE', 'FOUR_ZERO', 'FOUR_FIVE', 'FIVE_ZERO', 'FIVE_FIVE', 'SIX_ZERO', 'SIX_FIVE', 'SEVEN_ZERO');

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_court_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_host_id_fkey";

-- DropForeignKey
ALTER TABLE "court" DROP CONSTRAINT "court_location_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_user_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "access_token",
DROP COLUMN "access_token_expires_at",
DROP COLUMN "account_id",
DROP COLUMN "created_at",
DROP COLUMN "id_token",
DROP COLUMN "provider_id",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idToken" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "booking_time_end",
DROP COLUMN "booking_time_start",
DROP COLUMN "court_group",
DROP COLUMN "court_id",
DROP COLUMN "event_time_end",
DROP COLUMN "event_time_start",
DROP COLUMN "host_id",
DROP COLUMN "luma_id",
ADD COLUMN     "bookingTimeEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "bookingTimeStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "courtLocationId" TEXT NOT NULL,
ADD COLUMN     "eventTimeEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventTimeStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "lumaId" TEXT,
ADD COLUMN     "type" "bookingType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "bookingStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "court" DROP COLUMN "booking_duration",
DROP COLUMN "booking_style",
DROP COLUMN "location_id",
ADD COLUMN     "bookingDuration" INTEGER NOT NULL,
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "bookingStyle" "bookingStyle" NOT NULL,
ADD COLUMN     "locationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "ip_address",
DROP COLUMN "updated_at",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "rec_user_id",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "recUserId" TEXT;

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "court_location";

-- DropTable
DROP TABLE "user_role";

-- DropEnum
DROP TYPE "booking_status";

-- DropEnum
DROP TYPE "booking_style";

-- CreateTable
CREATE TABLE "courtLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "googlePlaceId" TEXT,
    "bookingUrl" TEXT,

    CONSTRAINT "courtLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "userRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "TennisProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gender" "Gender",
    "ageRange" "AgeRange",
    "ethnicity" "Ethnicity",
    "birthDate" TIMESTAMP(3),
    "instagramHandle" VARCHAR(50),
    "district" "District",
    "districtOther" VARCHAR(100),
    "tmacGearPreference" "TmacGearPreference",
    "tmacGearOther" VARCHAR(100),
    "gearSize" "GearSize",
    "playlistSong" VARCHAR(200),
    "whyJoinTmac" VARCHAR(500),
    "referredBy" VARCHAR(100),
    "tennisRanking" "TennisRanking",
    "favoriteTennisPlayer" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReminderAt" TIMESTAMP(3),

    CONSTRAINT "TennisProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TennisProfile_userId_key" ON "TennisProfile"("userId");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_courtLocationId_fkey" FOREIGN KEY ("courtLocationId") REFERENCES "courtLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court" ADD CONSTRAINT "court_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "courtLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court" ADD CONSTRAINT "court_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TennisProfile" ADD CONSTRAINT "TennisProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

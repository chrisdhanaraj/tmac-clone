/*
  Warnings:

  - You are about to drop the column `hostEmail` on the `booking` table. All the data in the column will be lost.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `TennisProfile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hostId` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TennisProfile" DROP CONSTRAINT "TennisProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."booking" DROP CONSTRAINT "booking_hostEmail_fkey";

-- DropIndex
DROP INDEX "public"."user_email_key";

-- AlterTable
ALTER TABLE "public"."booking" DROP COLUMN "hostEmail",
ADD COLUMN     "hostId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."session" DROP CONSTRAINT "session_pkey",
ADD COLUMN     "activeOrganizationId" TEXT;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "phone",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."verification" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."TennisProfile";

-- CreateTable
CREATE TABLE "public"."tennisProfile" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "public"."Gender",
    "ageRange" "public"."AgeRange",
    "ethnicity" "public"."Ethnicity",
    "birthDate" TIMESTAMP(3),
    "instagramHandle" VARCHAR(50),
    "district" "public"."District",
    "districtOther" VARCHAR(10000),
    "tmacGearPreference" "public"."TmacGearPreference",
    "tmacGearOther" VARCHAR(10000),
    "gearSize" "public"."GearSize",
    "playlistSong" VARCHAR(10000),
    "whyJoinTmac" TEXT,
    "referredBy" VARCHAR(10000),
    "tennisRanking" "public"."TennisRanking",
    "favoriteTennisPlayer" VARCHAR(10000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReminderAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "public"."organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tennisProfile_userId_key" ON "public"."tennisProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "public"."organization"("slug");

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tennisProfile" ADD CONSTRAINT "tennisProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

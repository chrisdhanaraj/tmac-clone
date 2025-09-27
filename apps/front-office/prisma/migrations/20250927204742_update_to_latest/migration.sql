/*
  Warnings:

  - The primary key for the `TennisProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TennisProfile` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - Made the column `userId` on table `TennisProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `TennisProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."user_email_key";

-- AlterTable
ALTER TABLE "public"."TennisProfile" DROP CONSTRAINT "TennisProfile_pkey",
DROP COLUMN "id",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "districtOther" SET DATA TYPE VARCHAR(10000),
ALTER COLUMN "tmacGearOther" SET DATA TYPE VARCHAR(10000),
ALTER COLUMN "playlistSong" SET DATA TYPE VARCHAR(10000),
ALTER COLUMN "whyJoinTmac" SET DATA TYPE TEXT,
ALTER COLUMN "referredBy" SET DATA TYPE VARCHAR(10000),
ALTER COLUMN "favoriteTennisPlayer" SET DATA TYPE VARCHAR(10000),
ADD CONSTRAINT "TennisProfile_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."feeder" (
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "firstFedAt" TIMESTAMP(3),
    "lastFedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "feeder_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."tennisRoles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tennisRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."userTennisRoles" (
    "userId" TEXT NOT NULL,
    "tennisRoleId" TEXT NOT NULL,

    CONSTRAINT "userTennisRoles_pkey" PRIMARY KEY ("userId","tennisRoleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "feeder_userId_key" ON "public"."feeder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tennisRoles_name_key" ON "public"."tennisRoles"("name");

-- AddForeignKey
ALTER TABLE "public"."feeder" ADD CONSTRAINT "feeder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userTennisRoles" ADD CONSTRAINT "userTennisRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userTennisRoles" ADD CONSTRAINT "userTennisRoles_tennisRoleId_fkey" FOREIGN KEY ("tennisRoleId") REFERENCES "public"."tennisRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

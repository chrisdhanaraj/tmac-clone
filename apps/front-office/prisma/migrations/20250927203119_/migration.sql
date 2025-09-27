/*
  Warnings:

  - You are about to drop the column `hostId` on the `booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hostEmail` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_hostId_fkey";

-- AlterTable
ALTER TABLE "TennisProfile" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "whyJoinTmac" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "hostId",
ADD COLUMN     "hostEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "discordId" TEXT;

-- CreateTable
CREATE TABLE "feeder" (
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "firstFedAt" TIMESTAMP(3),
    "lastFedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "feeder_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "tennisRoles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tennisRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userTennisRoles" (
    "userId" TEXT NOT NULL,
    "tennisRoleId" TEXT NOT NULL,

    CONSTRAINT "userTennisRoles_pkey" PRIMARY KEY ("userId","tennisRoleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "feeder_userId_key" ON "feeder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tennisRoles_name_key" ON "tennisRoles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_discordId_key" ON "user"("discordId");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_hostEmail_fkey" FOREIGN KEY ("hostEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeder" ADD CONSTRAINT "feeder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTennisRoles" ADD CONSTRAINT "userTennisRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTennisRoles" ADD CONSTRAINT "userTennisRoles_tennisRoleId_fkey" FOREIGN KEY ("tennisRoleId") REFERENCES "tennisRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

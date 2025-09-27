/*
  Warnings:

  - You are about to drop the column `email` on the `tennisProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `tennisProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `tennisProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `tennisProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."tennisProfile" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
ADD CONSTRAINT "tennisProfile_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "phone" TEXT;

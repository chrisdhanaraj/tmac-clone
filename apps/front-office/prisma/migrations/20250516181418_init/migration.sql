-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Draft', 'Ready', 'Complete', 'Cancelled');

-- CreateEnum
CREATE TYPE "BookingStyle" AS ENUM ('SevenDaysBefore8AM', 'TwoDaysBeforeNoon');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'Draft',
    "date" TIMESTAMP(3) NOT NULL,
    "bookingTimeStart" TIMESTAMP(3) NOT NULL,
    "bookingTimeEnd" TIMESTAMP(3) NOT NULL,
    "eventTimeStart" TIMESTAMP(3) NOT NULL,
    "eventTimeEnd" TIMESTAMP(3) NOT NULL,
    "courtSet" TEXT NOT NULL,
    "Luma_ID" TEXT,
    "hostId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtLocation" (
    "id" TEXT NOT NULL,
    "GooglePlaceID" TEXT,
    "BookingURL" TEXT,

    CONSTRAINT "CourtLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "bookingStyle" "BookingStyle" NOT NULL,
    "bookingDuration" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "RecUserID" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CourtLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

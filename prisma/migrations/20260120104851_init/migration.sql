-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "specificDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "providers_email_key" ON "providers"("email");

-- CreateIndex
CREATE INDEX "availabilities_providerId_idx" ON "availabilities"("providerId");

-- CreateIndex
CREATE INDEX "availabilities_dayOfWeek_idx" ON "availabilities"("dayOfWeek");

-- CreateIndex
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");

-- CreateIndex
CREATE INDEX "appointments_providerId_idx" ON "appointments"("providerId");

-- CreateIndex
CREATE INDEX "appointments_startTime_idx" ON "appointments"("startTime");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

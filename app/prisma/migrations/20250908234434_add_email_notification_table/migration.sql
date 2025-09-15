/*
  Warnings:

  - You are about to drop the column `personaExpiry` on the `KYCUser` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailNotificationType" AS ENUM ('KYCB_STARTED', 'KYCB_REMINDER', 'KYCB_APPROVED');

-- AlterTable
ALTER TABLE "KYCUser" DROP COLUMN "personaExpiry";

-- CreateTable
CREATE TABLE "EmailNotification" (
    "id" TEXT NOT NULL,
    "kycUserId" TEXT NOT NULL,
    "type" "EmailNotificationType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailTo" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailNotification_kycUserId_idx" ON "EmailNotification"("kycUserId");

-- CreateIndex
CREATE INDEX "EmailNotification_type_idx" ON "EmailNotification"("type");

-- CreateIndex
CREATE INDEX "EmailNotification_sentAt_idx" ON "EmailNotification"("sentAt");

-- AddForeignKey
ALTER TABLE "EmailNotification" ADD CONSTRAINT "EmailNotification_kycUserId_fkey" FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

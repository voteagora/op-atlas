-- AlterTable
ALTER TABLE "Citizen" ADD COLUMN IF NOT EXISTS "emailNotifEnabled" BOOLEAN NOT NULL DEFAULT true;


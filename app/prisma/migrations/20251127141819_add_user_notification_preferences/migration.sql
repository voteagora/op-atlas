-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailNotifEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Set default to true for existing citizens (per requirements: default is "on" for citizens)
UPDATE "User" 
SET "emailNotifEnabled" = true 
WHERE "id" IN (SELECT "userId" FROM "Citizen");


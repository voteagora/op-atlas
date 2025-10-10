-- Add personaReferenceId to KYCUser for Persona static link integration
ALTER TABLE "KYCUser"
ADD COLUMN "personaReferenceId" TEXT;

UPDATE "KYCUser"
SET "personaReferenceId" = "id"
WHERE "personaReferenceId" IS NULL;

ALTER TABLE "KYCUser"
ADD CONSTRAINT "KYCUser_personaReferenceId_key" UNIQUE ("personaReferenceId");

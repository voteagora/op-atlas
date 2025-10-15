-- Add endorsement window columns (idempotent)
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "endorsementStartAt" TIMESTAMP(3);
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "endorsementEndAt" TIMESTAMP(3);



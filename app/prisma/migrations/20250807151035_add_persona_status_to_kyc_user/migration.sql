-- CreateEnum
CREATE TYPE "PersonaStatus" AS ENUM ('created', 'pending', 'completed', 'failed', 'expired', 'needs_review', 'approved', 'declined');

-- AlterTable
ALTER TABLE "KYCUser" ADD COLUMN "personaStatus" "PersonaStatus"; 
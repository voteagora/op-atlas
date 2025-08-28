/*
  Warnings:

  - You are about to drop the `GrantEligibilityForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GrantEligibilityChangelog" DROP CONSTRAINT "GrantEligibilityChangelog_formId_fkey";

-- DropForeignKey
ALTER TABLE "GrantEligibilityForm" DROP CONSTRAINT "GrantEligibilityForm_kycTeamId_fkey";

-- DropForeignKey
ALTER TABLE "GrantEligibilityForm" DROP CONSTRAINT "GrantEligibilityForm_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "GrantEligibilityForm" DROP CONSTRAINT "GrantEligibilityForm_projectId_fkey";

-- DropTable
DROP TABLE "GrantEligibilityForm";

-- CreateTable
CREATE TABLE "GrantEligibility" (
    "id" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "grantType" "GrantType",
    "walletAddress" TEXT,
    "attestations" JSONB,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "projectId" TEXT,
    "organizationId" TEXT,
    "kycTeamId" TEXT,

    CONSTRAINT "GrantEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrantEligibility_projectId_idx" ON "GrantEligibility"("projectId");

-- CreateIndex
CREATE INDEX "GrantEligibility_organizationId_idx" ON "GrantEligibility"("organizationId");

-- CreateIndex
CREATE INDEX "GrantEligibility_kycTeamId_idx" ON "GrantEligibility"("kycTeamId");

-- CreateIndex
CREATE INDEX "GrantEligibility_createdAt_idx" ON "GrantEligibility"("createdAt");

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibilityChangelog" ADD CONSTRAINT "GrantEligibilityChangelog_formId_fkey" FOREIGN KEY ("formId") REFERENCES "GrantEligibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

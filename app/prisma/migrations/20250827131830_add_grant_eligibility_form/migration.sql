-- CreateEnum
CREATE TYPE "GrantEligibilityFormStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('RETRO_FUNDING', 'AUDIT_GRANT', 'GROWTH_GRANT', 'FOUNDATION_MISSION');

-- AlterTable
ALTER TABLE "ProjectBlacklist" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "proposalId" TEXT;

-- CreateTable
CREATE TABLE "GrantEligibilityForm" (
    "id" TEXT NOT NULL,
    "status" "GrantEligibilityFormStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "grantType" "GrantType",
    "walletAddress" TEXT,
    "attestations" JSONB,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "organizationId" TEXT,
    "kycTeamId" TEXT,

    CONSTRAINT "GrantEligibilityForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantEligibilityChangelog" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrantEligibilityChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrantEligibilityForm_projectId_idx" ON "GrantEligibilityForm"("projectId");

-- CreateIndex
CREATE INDEX "GrantEligibilityForm_organizationId_idx" ON "GrantEligibilityForm"("organizationId");

-- CreateIndex
CREATE INDEX "GrantEligibilityForm_kycTeamId_idx" ON "GrantEligibilityForm"("kycTeamId");

-- CreateIndex
CREATE INDEX "GrantEligibilityForm_status_idx" ON "GrantEligibilityForm"("status");

-- CreateIndex
CREATE INDEX "GrantEligibilityForm_createdAt_idx" ON "GrantEligibilityForm"("createdAt");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_formId_idx" ON "GrantEligibilityChangelog"("formId");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_action_idx" ON "GrantEligibilityChangelog"("action");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_createdAt_idx" ON "GrantEligibilityChangelog"("createdAt");

-- AddForeignKey
ALTER TABLE "GrantEligibilityForm" ADD CONSTRAINT "GrantEligibilityForm_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibilityForm" ADD CONSTRAINT "GrantEligibilityForm_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibilityForm" ADD CONSTRAINT "GrantEligibilityForm_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibilityChangelog" ADD CONSTRAINT "GrantEligibilityChangelog_formId_fkey" FOREIGN KEY ("formId") REFERENCES "GrantEligibilityForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

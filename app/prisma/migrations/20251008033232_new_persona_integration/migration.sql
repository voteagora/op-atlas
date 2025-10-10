/*
  Warnings:

  - A unique constraint covering the columns `[personaInquiryId]` on the table `KYCLegalEntity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personaInquiryId]` on the table `KYCUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EmailNotification" DROP CONSTRAINT "EmailNotification_kycUserId_fkey";

-- AlterTable
ALTER TABLE "KYCLegalEntity" RENAME CONSTRAINT "LegalEntity_pkey" TO "KYCLegalEntity_pkey";

-- AlterTable
ALTER TABLE "KYCLegalEntity" 
ADD COLUMN     "inquiryCreatedAt" TIMESTAMP(3),
ADD COLUMN     "personaInquiryId" TEXT;
-- AlterTable
ALTER TABLE "KYCLegalEntityController" RENAME CONSTRAINT "LegalEnitityController_pkey" TO "KYCLegalEntityController_pkey";

-- AlterTable
ALTER TABLE "KYCLegalEntityTeams" RENAME CONSTRAINT "KYCTeamEntity_pkey" TO "KYCLegalEntityTeams_pkey";

-- AlterTable
ALTER TABLE "KYCUser" ADD COLUMN     "inquiryCreatedAt" TIMESTAMP(3),
ADD COLUMN     "personaInquiryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KYCLegalEntity_personaInquiryId_key" ON "KYCLegalEntity"("personaInquiryId");

-- CreateIndex
CREATE INDEX "KYCLegalEntity_personaInquiryId_idx" ON "KYCLegalEntity"("personaInquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "KYCUser_personaInquiryId_key" ON "KYCUser"("personaInquiryId");

-- CreateIndex
CREATE INDEX "KYCUser_personaInquiryId_idx" ON "KYCUser"("personaInquiryId");

-- RenameForeignKey
ALTER TABLE "KYCLegalEntity" RENAME CONSTRAINT "LegalEntity_legalEnitityControllerId_fkey" TO "KYCLegalEntity_kycLegalEntityControllerId_fkey";

-- RenameForeignKey
ALTER TABLE "KYCLegalEntityTeams" RENAME CONSTRAINT "KYCTeamEntity_kycTeamId_fkey" TO "KYCLegalEntityTeams_kycTeamId_fkey";

-- RenameForeignKey
ALTER TABLE "KYCLegalEntityTeams" RENAME CONSTRAINT "KYCTeamEntity_legalEntityId_fkey" TO "KYCLegalEntityTeams_legalEntityId_fkey";

-- RenameIndex
ALTER INDEX "EmailNotification_kycUserId_idx" RENAME TO "EmailNotification_referenceId_idx";

-- RenameIndex
ALTER INDEX "LegalEntity_name_idx" RENAME TO "KYCLegalEntity_name_idx";

-- RenameIndex
ALTER INDEX "LegalEntity_personaReferenceId_key" RENAME TO "KYCLegalEntity_personaReferenceId_key";

-- RenameIndex
ALTER INDEX "LegalEnitityController_email_idx" RENAME TO "KYCLegalEntityController_email_idx";

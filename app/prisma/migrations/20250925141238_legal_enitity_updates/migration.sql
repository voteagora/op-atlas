/*
  Warnings:

  - The primary key for the `UserSafeAddresses` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "UserSafeAddresses" DROP CONSTRAINT "UserSafeAddresses_userId_fkey";

-- AlterTable
ALTER TABLE "UserSafeAddresses" DROP CONSTRAINT "UserSafeAddresses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "UserSafeAddresses_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "LegalEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legalEnitityControllerId" TEXT,

    CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalEnitityController" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalEnitityController_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCTeamEntity" (
    "kycTeamId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCTeamEntity_pkey" PRIMARY KEY ("kycTeamId","legalEntityId")
);

-- CreateIndex
CREATE INDEX "LegalEntity_name_idx" ON "LegalEntity"("name");

-- CreateIndex
CREATE INDEX "LegalEnitityController_email_idx" ON "LegalEnitityController"("email");

-- AddForeignKey
ALTER TABLE "LegalEntity" ADD CONSTRAINT "LegalEntity_legalEnitityControllerId_fkey" FOREIGN KEY ("legalEnitityControllerId") REFERENCES "LegalEnitityController"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCTeamEntity" ADD CONSTRAINT "KYCTeamEntity_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCTeamEntity" ADD CONSTRAINT "KYCTeamEntity_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSafeAddresses" ADD CONSTRAINT "UserSafeAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- No longer treating legal entities as a type of KYC Entity, therefore, all KYC entities are now Users

-- Drop the kycUserType column from the KYCUser table
ALTER TABLE "KYCUser"
    DROP COLUMN IF EXISTS "kycUserType";

-- Drop the KYCUserType enum if it exists
DROP TYPE IF EXISTS "KYCUserType";


-- Rename kycUserId to ReferenceId in the EmailNotification table
ALTER TABLE "EmailNotification"
    RENAME COLUMN "kycUserId" TO "ReferenceId";
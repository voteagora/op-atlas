-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "KYCUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "businessName" TEXT,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCTeam" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCUserTeams" (
    "id" TEXT NOT NULL,
    "kycUserId" TEXT NOT NULL,
    "kycTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCUserTeams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectKYCTeam" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kycTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectKYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationKYCTeam" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kycTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationKYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KYCUser_email_idx" ON "KYCUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KYCTeam_walletAddress_key" ON "KYCTeam"("walletAddress");

-- CreateIndex
CREATE INDEX "KYCTeam_walletAddress_idx" ON "KYCTeam"("walletAddress");

-- CreateIndex
CREATE INDEX "KYCUserTeams_kycUserId_idx" ON "KYCUserTeams"("kycUserId");

-- CreateIndex
CREATE INDEX "KYCUserTeams_kycTeamId_idx" ON "KYCUserTeams"("kycTeamId");

-- CreateIndex
CREATE INDEX "ProjectKYCTeam_kycTeamId_idx" ON "ProjectKYCTeam"("kycTeamId");

-- CreateIndex
CREATE INDEX "OrganizationKYCTeam_organizationId_idx" ON "OrganizationKYCTeam"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationKYCTeam_kycTeamId_idx" ON "OrganizationKYCTeam"("kycTeamId");

-- AddForeignKey
ALTER TABLE "KYCUserTeams" ADD CONSTRAINT "KYCUserTeams_kycUserId_fkey" FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCUserTeams" ADD CONSTRAINT "KYCUserTeams_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectKYCTeam" ADD CONSTRAINT "ProjectKYCTeam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectKYCTeam" ADD CONSTRAINT "ProjectKYCTeam_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationKYCTeam" ADD CONSTRAINT "OrganizationKYCTeam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationKYCTeam" ADD CONSTRAINT "OrganizationKYCTeam_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

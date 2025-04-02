-- DropForeignKey
ALTER TABLE "KYCUserTeams" DROP CONSTRAINT "KYCUserTeams_kycTeamId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationKYCTeam" DROP CONSTRAINT "OrganizationKYCTeam_kycTeamId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectKYCTeam" DROP CONSTRAINT "ProjectKYCTeam_kycTeamId_fkey";

-- CreateTable
CREATE TABLE "ProjectOSO" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "osoId" TEXT NOT NULL,
    "roundId" TEXT,

    CONSTRAINT "ProjectOSO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectOSOData" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "osoId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "projectOSOData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectOSO_projectId_idx" ON "ProjectOSO"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOSO_osoId_idx" ON "ProjectOSO"("osoId");

-- CreateIndex
CREATE INDEX "projectOSOData_projectId_idx" ON "projectOSOData"("projectId");

-- CreateIndex
CREATE INDEX "projectOSOData_osoId_idx" ON "projectOSOData"("osoId");

-- AddForeignKey
ALTER TABLE "KYCUserTeams" ADD CONSTRAINT "KYCUserTeams_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectKYCTeam" ADD CONSTRAINT "ProjectKYCTeam_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationKYCTeam" ADD CONSTRAINT "OrganizationKYCTeam_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectOSOData" ADD CONSTRAINT "projectOSOData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

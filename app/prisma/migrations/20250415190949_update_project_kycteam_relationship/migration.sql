-- DropForeignKey
ALTER TABLE "ProjectKYCTeam" DROP CONSTRAINT "ProjectKYCTeam_kycTeamId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectKYCTeam" DROP CONSTRAINT "ProjectKYCTeam_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "kycTeamId" TEXT;

-- Migrate data from ProjectKYCTeam to Project
UPDATE "Project" p
SET "kycTeamId" = pkt."kycTeamId"
FROM "ProjectKYCTeam" pkt
WHERE p.id = pkt."projectId";

-- DropTable
DROP TABLE "ProjectKYCTeam";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

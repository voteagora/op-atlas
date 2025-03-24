-- DropForeignKey
ALTER TABLE "ProjectOSO" DROP CONSTRAINT "ProjectOSO_roundId_fkey";

-- AlterTable
ALTER TABLE "ProjectOSO" ALTER COLUMN "roundId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

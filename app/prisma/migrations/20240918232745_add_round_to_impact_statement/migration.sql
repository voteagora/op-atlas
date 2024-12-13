-- AlterTable
ALTER TABLE "ImpactStatement" ADD COLUMN     "roundId" TEXT;

-- AddForeignKey
ALTER TABLE "ImpactStatement" ADD CONSTRAINT "ImpactStatement_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

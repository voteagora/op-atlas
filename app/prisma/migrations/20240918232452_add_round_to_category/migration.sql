-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "roundId" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

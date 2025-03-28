/*
  Warnings:

  - Added the required column `roundId` to the `ProjectOSO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectOSO" ADD COLUMN     "roundId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

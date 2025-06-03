/*
  Warnings:

  - You are about to drop the column `rewardStreamId` on the `KYCTeam` table. All the data in the column will be lost.
  - Added the required column `kycTeamId` to the `RewardStream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KYCTeam" DROP CONSTRAINT "KYCTeam_rewardStreamId_fkey";

-- AlterTable
ALTER TABLE "KYCTeam" DROP COLUMN "rewardStreamId";

-- AlterTable
ALTER TABLE "RewardStream" ADD COLUMN     "kycTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RewardStream" ADD CONSTRAINT "RewardStream_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `RewardStream` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RewardStream` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SuperfluidStream` table. All the data in the column will be lost.
  - Added the required column `roundId` to the `RewardStream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deposit` to the `SuperfluidStream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SuperfluidStream" DROP CONSTRAINT "SuperfluidStream_internalStreamId_fkey";

-- AlterTable
ALTER TABLE "RewardStream" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SuperfluidStream" DROP COLUMN "status",
ADD COLUMN     "deposit" TEXT NOT NULL,
ALTER COLUMN "internalStreamId" DROP NOT NULL;

-- DropEnum
DROP TYPE "StreamStatus";

-- CreateIndex
CREATE INDEX "SuperfluidStream_sender_idx" ON "SuperfluidStream"("sender");

-- CreateIndex
CREATE INDEX "SuperfluidStream_receiver_idx" ON "SuperfluidStream"("receiver");

-- AddForeignKey
ALTER TABLE "SuperfluidStream" ADD CONSTRAINT "SuperfluidStream_internalStreamId_fkey" FOREIGN KEY ("internalStreamId") REFERENCES "RewardStream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardStream" ADD CONSTRAINT "RewardStream_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

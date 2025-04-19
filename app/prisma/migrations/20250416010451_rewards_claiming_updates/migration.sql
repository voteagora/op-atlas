-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "KYCTeam" ADD COLUMN     "rewardStreamId" TEXT;

-- CreateTable
CREATE TABLE "RecurringReward" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "tranche" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecurringReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperfluidStream" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "flowRate" TEXT NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "internalStreamId" TEXT NOT NULL,

    CONSTRAINT "SuperfluidStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardStream" (
    "id" TEXT NOT NULL,
    "projects" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RewardStream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringReward_projectId_idx" ON "RecurringReward"("projectId");

-- CreateIndex
CREATE INDEX "RecurringReward_roundId_idx" ON "RecurringReward"("roundId");

-- CreateIndex
CREATE INDEX "RecurringReward_tranche_idx" ON "RecurringReward"("tranche");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringReward_roundId_tranche_projectId_key" ON "RecurringReward"("roundId", "tranche", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperfluidStream_sender_receiver_key" ON "SuperfluidStream"("sender", "receiver");

-- AddForeignKey
ALTER TABLE "KYCTeam" ADD CONSTRAINT "KYCTeam_rewardStreamId_fkey" FOREIGN KEY ("rewardStreamId") REFERENCES "RewardStream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringReward" ADD CONSTRAINT "RecurringReward_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringReward" ADD CONSTRAINT "RecurringReward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperfluidStream" ADD CONSTRAINT "SuperfluidStream_internalStreamId_fkey" FOREIGN KEY ("internalStreamId") REFERENCES "RewardStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

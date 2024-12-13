-- CreateTable
CREATE TABLE "FundingReward" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardClaim" (
    "rewardId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "address" TEXT,
    "addressSetAt" TIMESTAMP(3),
    "addressSetById" TEXT,
    "tokenStreamStatus" TEXT,
    "tokenStreamClaimableAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("rewardId")
);

-- CreateIndex
CREATE INDEX "FundingReward_projectId_idx" ON "FundingReward"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingReward_roundId_projectId_key" ON "FundingReward"("roundId", "projectId");

-- AddForeignKey
ALTER TABLE "FundingReward" ADD CONSTRAINT "FundingReward_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingReward" ADD CONSTRAINT "FundingReward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "FundingReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_addressSetById_fkey" FOREIGN KEY ("addressSetById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

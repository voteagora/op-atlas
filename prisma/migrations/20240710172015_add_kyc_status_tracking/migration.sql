-- AlterTable
ALTER TABLE "RewardClaim" ADD COLUMN     "kycStatus" TEXT,
ADD COLUMN     "kycStatusUpdatedAt" TIMESTAMP(3);

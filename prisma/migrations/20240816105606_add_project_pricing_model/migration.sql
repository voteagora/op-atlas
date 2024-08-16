-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "pricingModel" TEXT,
ADD COLUMN     "pricingModelDetails" TEXT;

-- AlterTable
ALTER TABLE "ProjectFunding" ADD COLUMN     "fundingRound" TEXT;

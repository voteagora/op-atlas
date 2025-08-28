-- CreateEnum
CREATE TYPE "KYCUserType" AS ENUM ('USER', 'LEGAL_ENTITY');

-- AlterTable
ALTER TABLE "KYCUser" ADD COLUMN     "kycUserType" "KYCUserType" NOT NULL DEFAULT 'USER';

-- DropForeignKey
ALTER TABLE "UserKYCUser" DROP CONSTRAINT "UserKYCUser_kycUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserKYCUser" DROP CONSTRAINT "UserKYCUser_userId_fkey";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "endorsementEndAt" TIMESTAMP(3),
ADD COLUMN     "endorsementStartAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "UserKYCUser";

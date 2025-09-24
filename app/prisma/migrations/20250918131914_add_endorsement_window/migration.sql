-- DropForeignKey (guarded)
ALTER TABLE IF EXISTS "UserKYCUser" DROP CONSTRAINT IF EXISTS "UserKYCUser_kycUserId_fkey";

-- DropForeignKey (guarded)
ALTER TABLE IF EXISTS "UserKYCUser" DROP CONSTRAINT IF EXISTS "UserKYCUser_userId_fkey";

-- AlterTable (idempotent)
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "endorsementEndAt" TIMESTAMP(3);
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "endorsementStartAt" TIMESTAMP(3);

-- DropTable (guarded)
DROP TABLE IF EXISTS "UserKYCUser";

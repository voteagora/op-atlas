/*
  Warnings:

  - You are about to drop the column `status` on the `GrantEligibilityForm` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "GrantEligibilityForm_status_idx";

-- AlterTable
ALTER TABLE "GrantEligibilityForm" DROP COLUMN "status",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "GrantEligibilityFormStatus";

/*
  Warnings:

  - You are about to drop the column `tags` on the `UserAddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "UserEmail" ADD COLUMN     "tags" TEXT[];

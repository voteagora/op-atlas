/*
  Warnings:

  - You are about to drop the column `limitToOptions` on the `ImpactStatement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ImpactStatement" DROP COLUMN "limitToOptions",
ADD COLUMN     "limitToCategoryOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "selectionOptions" TEXT[];

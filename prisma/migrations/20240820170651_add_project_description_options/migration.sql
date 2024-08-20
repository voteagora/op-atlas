/*
  Warnings:

  - You are about to drop the column `projectDescriptionOption` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "projectDescriptionOption",
ADD COLUMN     "projectDescriptionOptions" TEXT[];

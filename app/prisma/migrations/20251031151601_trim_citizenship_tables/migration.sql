/*
  Warnings:

  - You are about to drop the column `trustScore` on the `CitizenSeason` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CitizenSeason` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCompletedAt` on the `CitizenSeason` table. All the data in the column will be lost.
  - You are about to drop the column `citizenSeasonId` on the `CitizenSeasonEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `combinedScore` on the `CitizenSeasonEvaluation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CitizenSeasonEvaluation" DROP CONSTRAINT "CitizenSeasonEvaluation_citizenSeasonId_fkey";

-- DropIndex
DROP INDEX "CitizenSeason_seasonId_type_idx";

-- DropIndex
DROP INDEX "CitizenSeasonEvaluation_citizenSeasonId_idx";

-- AlterTable
ALTER TABLE "CitizenSeason" DROP COLUMN "trustScore",
DROP COLUMN "type",
DROP COLUMN "verificationCompletedAt";

-- AlterTable
ALTER TABLE "CitizenSeasonEvaluation" DROP COLUMN "citizenSeasonId",
DROP COLUMN "combinedScore";

-- CreateIndex
CREATE INDEX "CitizenSeason_seasonId_userId_idx" ON "CitizenSeason"("seasonId", "userId");

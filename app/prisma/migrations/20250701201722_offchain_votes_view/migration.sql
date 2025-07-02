/*
  Warnings:

  - You are about to drop the `OffChainVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OffChainVote" DROP CONSTRAINT "OffChainVote_citizenId_fkey";

-- DropTable
DROP TABLE "OffChainVote";



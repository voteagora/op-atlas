-- CreateEnum
CREATE TYPE "citizenCategory" AS ENUM ('CHAIN', 'APP', 'USER');

-- DropForeignKey
ALTER TABLE "UserPassport" DROP CONSTRAINT "UserPassport_address_fkey";

-- AlterTable
ALTER TABLE "Citizen" ALTER COLUMN "address" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OffChainVote" (
    "attestationId" TEXT NOT NULL,
    "voterAddress" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "vote" JSONB NOT NULL,
    "transactionHash" TEXT,
    "citizenId" INTEGER NOT NULL,
    "citizenCategory" "citizenCategory" NOT NULL DEFAULT 'CHAIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffChainVote_pkey" PRIMARY KEY ("attestationId")
);

-- CreateIndex
CREATE INDEX "OffChainVote_voterAddress_idx" ON "OffChainVote"("voterAddress");

-- CreateIndex
CREATE INDEX "OffChainVote_proposalId_idx" ON "OffChainVote"("proposalId");

-- CreateIndex
CREATE INDEX "OffChainVote_citizenId_idx" ON "OffChainVote"("citizenId");

-- CreateIndex
CREATE INDEX "OffChainVote_transactionHash_idx" ON "OffChainVote"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "OffChainVote_proposalId_citizenId_key" ON "OffChainVote"("proposalId", "citizenId");

-- AddForeignKey
ALTER TABLE "OffChainVote" ADD CONSTRAINT "OffChainVote_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

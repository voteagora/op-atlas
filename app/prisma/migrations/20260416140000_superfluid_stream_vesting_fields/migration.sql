-- AlterTable
ALTER TABLE "SuperfluidStream"
  ADD COLUMN "startDate"         BIGINT,
  ADD COLUMN "endDate"            BIGINT,
  ADD COLUMN "endExecutedAt"      BIGINT,
  ADD COLUMN "settledAmount"      TEXT,
  ADD COLUMN "remainderAmount"    TEXT,
  ADD COLUMN "failedAt"           BIGINT,
  ADD COLUMN "cliffAmount"        TEXT,
  ADD COLUMN "superToken"         TEXT,
  ADD COLUMN "contractVersion"    TEXT,
  ADD COLUMN "subgraphDeletedAt"  BIGINT;

-- CreateIndex
CREATE INDEX "SuperfluidStream_superToken_idx" ON "SuperfluidStream"("superToken");

-- CreateTable
CREATE TABLE "SuperfluidTransfer" (
    "id"              TEXT NOT NULL,
    "kind"            TEXT NOT NULL,
    "receiver"        TEXT NOT NULL,
    "superToken"      TEXT NOT NULL,
    "sender"          TEXT,
    "amount"          TEXT NOT NULL,
    "timestamp"       BIGINT NOT NULL,
    "transactionHash" TEXT,
    "blockNumber"     BIGINT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperfluidTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuperfluidTransfer_receiver_superToken_timestamp_idx" ON "SuperfluidTransfer"("receiver", "superToken", "timestamp");

-- CreateIndex
CREATE INDEX "SuperfluidTransfer_timestamp_idx" ON "SuperfluidTransfer"("timestamp");

-- CreateIndex
CREATE INDEX "SuperfluidTransfer_kind_idx" ON "SuperfluidTransfer"("kind");

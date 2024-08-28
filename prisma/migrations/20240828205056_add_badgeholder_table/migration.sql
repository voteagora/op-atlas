-- CreateTable
CREATE TABLE "Badgeholder" (
    "address" TEXT NOT NULL,
    "roundId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Badgeholder_address_roundId_key" ON "Badgeholder"("address", "roundId");

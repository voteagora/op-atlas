-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "nomineeApplicationId" INTEGER NOT NULL,
    "endorserAddress" TEXT NOT NULL,
    "endorserUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_context_nomineeApplicationId_endorserAddress_key"
  ON "Endorsement"("context", "nomineeApplicationId", "endorserAddress");

-- CreateIndex
CREATE INDEX "Endorsement_context_nomineeApplicationId_idx"
  ON "Endorsement"("context", "nomineeApplicationId");

-- CreateIndex
CREATE INDEX "Endorsement_endorserAddress_idx" ON "Endorsement"("endorserAddress");

-- AddForeignKey
ALTER TABLE "Endorsement"
  ADD CONSTRAINT "Endorsement_nomineeApplicationId_fkey"
  FOREIGN KEY ("nomineeApplicationId") REFERENCES "RoleApplication"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement"
  ADD CONSTRAINT "Endorsement_endorserUserId_fkey"
  FOREIGN KEY ("endorserUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;



-- AlterTable
ALTER TABLE "LegalEntity" ADD COLUMN "personaReferenceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LegalEntity_personaReferenceId_key" ON "LegalEntity"("personaReferenceId");

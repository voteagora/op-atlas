-- AlterTable
ALTER TABLE "Citizen"
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "projectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_organizationId_key" ON "Citizen"("organizationId") WHERE "organizationId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_projectId_key" ON "Citizen"("projectId") WHERE "projectId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Citizen_projectId_idx" ON "Citizen"("projectId");

-- CreateIndex
CREATE INDEX "Citizen_organizationId_idx" ON "Citizen"("organizationId");
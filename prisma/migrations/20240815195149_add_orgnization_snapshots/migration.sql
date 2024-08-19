-- CreateTable
CREATE TABLE "OrganizationSnapshot" (
    "id" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationSnapshot_organizationId_idx" ON "OrganizationSnapshot"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationSnapshot" ADD CONSTRAINT "OrganizationSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

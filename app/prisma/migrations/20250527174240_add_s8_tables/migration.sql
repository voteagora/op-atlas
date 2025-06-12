-- CreateTable
CREATE TABLE "S8QualifyingUser" (
    "address" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingUser_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "S8QualifyingChain" (
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingChain_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "S8QualifyingProject" (
    "projectId" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingProject_pkey" PRIMARY KEY ("projectId")
);

-- CreateIndex
CREATE INDEX "S8QualifyingUser_address_idx" ON "S8QualifyingUser"("address");

-- CreateIndex
CREATE INDEX "S8QualifyingChain_organizationId_idx" ON "S8QualifyingChain"("organizationId");

-- CreateIndex
CREATE INDEX "S8QualifyingProject_projectId_idx" ON "S8QualifyingProject"("projectId"); 
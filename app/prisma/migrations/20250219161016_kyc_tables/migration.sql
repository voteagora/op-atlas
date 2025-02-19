-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCTeam" (
    "id" TEXT NOT NULL,
    "grantAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KYC_email_idx" ON "KYC"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KYCTeam_grantAddress_key" ON "KYCTeam"("grantAddress");

-- CreateIndex
CREATE INDEX "KYCTeam_id_grantAddress_idx" ON "KYCTeam"("id", "grantAddress");

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

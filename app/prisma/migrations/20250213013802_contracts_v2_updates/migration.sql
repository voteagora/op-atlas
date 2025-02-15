-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "defiLlamaSlug" TEXT[];

-- AlterTable
ALTER TABLE "ProjectContract" ADD COLUMN     "verificationChainId" INTEGER;

-- CreateTable
CREATE TABLE "PublishedContract" (
    "id" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "deployer" TEXT NOT NULL,
    "deploymentTx" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "verificationChainId" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PublishedContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectContract_deployerAddress_idx" ON "ProjectContract"("deployerAddress");

-- AddForeignKey
ALTER TABLE "PublishedContract" ADD CONSTRAINT "PublishedContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

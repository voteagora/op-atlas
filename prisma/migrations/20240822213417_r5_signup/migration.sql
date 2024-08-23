-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "projectDescriptionOptions" TEXT[];

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "hasCodeRepositories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOnChainContract" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pricingModel" TEXT,
ADD COLUMN     "pricingModelDetails" TEXT;

-- AlterTable
ALTER TABLE "ProjectContract" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "ProjectFunding" ADD COLUMN     "fundingRound" TEXT;

-- AlterTable
ALTER TABLE "ProjectRepository" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishSetupLinkClicked" BOOLEAN NOT NULL DEFAULT false,
    "orgSettingsVisited" BOOLEAN NOT NULL DEFAULT false,
    "profileVisitCount" INTEGER NOT NULL DEFAULT 0,
    "viewProfileClicked" BOOLEAN NOT NULL DEFAULT false,
    "homePageViewCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteracted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSnapshot" (
    "id" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "question" TEXT NOT NULL,
    "options" TEXT[],

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactStatement" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "subtext" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isMarkdownSupported" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ImpactStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactStatementAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "impactStatementId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ImpactStatementAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLinks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInteraction_userId_key" ON "UserInteraction"("userId");

-- CreateIndex
CREATE INDEX "OrganizationSnapshot_organizationId_idx" ON "OrganizationSnapshot"("organizationId");

-- CreateIndex
CREATE INDEX "ImpactStatement_categoryId_idx" ON "ImpactStatement"("categoryId");

-- CreateIndex
CREATE INDEX "ImpactStatementAnswer_applicationId_impactStatementId_idx" ON "ImpactStatementAnswer"("applicationId", "impactStatementId");

-- CreateIndex
CREATE INDEX "ProjectLinks_projectId_idx" ON "ProjectLinks"("projectId");

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSnapshot" ADD CONSTRAINT "OrganizationSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatement" ADD CONSTRAINT "ImpactStatement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_impactStatementId_fkey" FOREIGN KEY ("impactStatementId") REFERENCES "ImpactStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLinks" ADD CONSTRAINT "ProjectLinks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

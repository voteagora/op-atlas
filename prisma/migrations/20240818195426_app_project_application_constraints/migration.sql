/*
  Warnings:

  - You are about to drop the column `additionalComments` on the `ApplicationProject` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `ApplicationProject` table. All the data in the column will be lost.
  - You are about to drop the column `dependentEntities` on the `ApplicationProject` table. All the data in the column will be lost.
  - You are about to drop the column `successMetrics` on the `ApplicationProject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationProject" DROP COLUMN "additionalComments",
DROP COLUMN "categories",
DROP COLUMN "dependentEntities",
DROP COLUMN "successMetrics",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "projectDescriptionOption" TEXT NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "UserProjects" ADD COLUMN     "isOrganizationMember" BOOLEAN NOT NULL DEFAULT false;

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
    "applicationProjectId" TEXT NOT NULL,
    "impactStatementId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ImpactStatementAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpactStatement_categoryId_idx" ON "ImpactStatement"("categoryId");

-- CreateIndex
CREATE INDEX "ImpactStatementAnswer_applicationProjectId_impactStatementI_idx" ON "ImpactStatementAnswer"("applicationProjectId", "impactStatementId");

-- AddForeignKey
ALTER TABLE "ApplicationProject" ADD CONSTRAINT "ApplicationProject_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatement" ADD CONSTRAINT "ImpactStatement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_applicationProjectId_fkey" FOREIGN KEY ("applicationProjectId") REFERENCES "ApplicationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_impactStatementId_fkey" FOREIGN KEY ("impactStatementId") REFERENCES "ImpactStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

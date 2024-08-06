/*
  Warnings:

  - You are about to drop the column `attestationId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Application` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_projectId_fkey";

-- DropIndex
DROP INDEX "Application_projectId_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "attestationId",
DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "ProjectRepository" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "ApplicationProject" (
    "id" TEXT NOT NULL,
    "categories" TEXT[],
    "attestationId" TEXT NOT NULL,
    "dependentEntities" TEXT NOT NULL,
    "successMetrics" TEXT NOT NULL,
    "additionalComments" TEXT,
    "applicationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ApplicationProject_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "_ApplicationToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationProject_applicationId_projectId_key" ON "ApplicationProject"("applicationId", "projectId");

-- CreateIndex
CREATE INDEX "ProjectLinks_projectId_idx" ON "ProjectLinks"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "_ApplicationToProject_AB_unique" ON "_ApplicationToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_ApplicationToProject_B_index" ON "_ApplicationToProject"("B");

-- AddForeignKey
ALTER TABLE "ApplicationProject" ADD CONSTRAINT "ApplicationProject_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationProject" ADD CONSTRAINT "ApplicationProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLinks" ADD CONSTRAINT "ProjectLinks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationToProject" ADD CONSTRAINT "_ApplicationToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationToProject" ADD CONSTRAINT "_ApplicationToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

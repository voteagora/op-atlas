-- AlterTable
ALTER TABLE "ProjectRepository" ADD COLUMN     "crate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "npmPackage" BOOLEAN NOT NULL DEFAULT false;

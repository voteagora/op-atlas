-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "hasCodeRepositories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOnChainContract" BOOLEAN NOT NULL DEFAULT true;

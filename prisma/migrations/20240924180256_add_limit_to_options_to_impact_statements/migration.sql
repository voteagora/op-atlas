-- AlterTable
ALTER TABLE "ImpactStatement" ADD COLUMN     "limitToOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

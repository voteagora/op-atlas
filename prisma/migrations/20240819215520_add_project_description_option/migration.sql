-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_categoryId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "projectDescriptionOption" TEXT NOT NULL DEFAULT '0',
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

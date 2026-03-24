-- DropForeignKey
ALTER TABLE "CitizenSeason" DROP CONSTRAINT "CitizenSeason_userId_fkey";

-- AlterTable
ALTER TABLE "CitizenSeason" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CitizenSeason" ADD CONSTRAINT "CitizenSeason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

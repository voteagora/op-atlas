-- AlterEnum
ALTER TYPE "EmailNotificationType" ADD VALUE 'KYC_EMAIL_VERIFICATION';

-- AlterTable
ALTER TABLE "KYCUser" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserEmail" ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmail_verificationToken_key" ON "UserEmail"("verificationToken");

-- CreateIndex
CREATE INDEX "UserEmail_verificationToken_idx" ON "UserEmail"("verificationToken");
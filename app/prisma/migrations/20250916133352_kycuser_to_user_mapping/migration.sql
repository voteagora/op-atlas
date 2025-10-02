-- CreateTable
CREATE TABLE "UserKYCUser" (
    "id" TEXT NOT NULL,
    "kycUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserKYCUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserKYCUser_userId_idx" ON "UserKYCUser"("userId");

-- CreateIndex
CREATE INDEX "UserKYCUser_kycUserId_idx" ON "UserKYCUser"("kycUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKYCUser_userId_kycUserId_key" ON "UserKYCUser"("userId", "kycUserId");

-- AddForeignKey
ALTER TABLE "UserKYCUser" ADD CONSTRAINT "UserKYCUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKYCUser" ADD CONSTRAINT "UserKYCUser_kycUserId_fkey" FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

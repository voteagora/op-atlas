-- CreateTable
CREATE TABLE "UserPassport" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "score" DECIMAL(10,3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPassport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPassport_address_key" ON "UserPassport"("address");

-- CreateIndex
CREATE INDEX "UserPassport_userId_idx" ON "UserPassport"("userId");

-- AddForeignKey
ALTER TABLE "UserPassport" ADD CONSTRAINT "UserPassport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

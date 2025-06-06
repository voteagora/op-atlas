-- CreateTable
CREATE TABLE "UserWorldId" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "nullifierHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorldId_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWorldId_userId_key" ON "UserWorldId"("userId");

-- CreateIndex
CREATE INDEX "UserWorldId_userId_idx" ON "UserWorldId"("userId");

-- AddForeignKey
ALTER TABLE "UserWorldId" ADD CONSTRAINT "UserWorldId_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 
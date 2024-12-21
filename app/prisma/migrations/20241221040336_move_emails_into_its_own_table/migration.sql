/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- First create the new table
CREATE TABLE "UserEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmail_pkey" PRIMARY KEY ("id")
);

-- Move existing data
INSERT INTO "UserEmail" ("id", "email", "userId", "verified", "updatedAt")
SELECT 
    gen_random_uuid(),
    "email",
    "id" as "userId",
    "emailVerified" as "verified",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "User"
WHERE "email" IS NOT NULL;

-- Add foreign key
ALTER TABLE "UserEmail" ADD CONSTRAINT "UserEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Now it's safe to drop the columns
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "emailVerified";

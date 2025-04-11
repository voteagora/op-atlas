/*
  Warnings:

  - You are about to drop the column `tags` on the `UserEmail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserEmail" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "ContactEmailTags" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactEmailTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactEmailTags_email_key" ON "ContactEmailTags"("email");

-- CreateIndex
CREATE INDEX "ContactEmailTags_email_idx" ON "ContactEmailTags"("email");

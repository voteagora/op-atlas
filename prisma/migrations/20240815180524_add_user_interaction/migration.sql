-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishSetupLinkClicked" BOOLEAN NOT NULL DEFAULT false,
    "orgSettingsVisited" BOOLEAN NOT NULL DEFAULT false,
    "profileVisitCount" INTEGER NOT NULL DEFAULT 0,
    "viewProfileClicked" BOOLEAN NOT NULL DEFAULT false,
    "homePageViewCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteracted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInteraction_userId_key" ON "UserInteraction"("userId");

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

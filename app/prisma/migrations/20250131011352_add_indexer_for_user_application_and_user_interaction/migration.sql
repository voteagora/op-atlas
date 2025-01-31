-- CreateIndex
CREATE INDEX "Application_roundId_idx" ON "Application"("roundId");

-- CreateIndex
CREATE INDEX "Application_categoryId_idx" ON "Application"("categoryId");

-- CreateIndex
CREATE INDEX "User_farcasterId_idx" ON "User"("farcasterId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");

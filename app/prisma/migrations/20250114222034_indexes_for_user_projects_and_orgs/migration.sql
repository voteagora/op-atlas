-- CreateIndex
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "UserEmail_userId_idx" ON "UserEmail"("userId");

-- CreateIndex
CREATE INDEX "UserOrganization_deletedAt_idx" ON "UserOrganization"("deletedAt");

-- CreateIndex
CREATE INDEX "UserOrganization_userId_idx" ON "UserOrganization"("userId");

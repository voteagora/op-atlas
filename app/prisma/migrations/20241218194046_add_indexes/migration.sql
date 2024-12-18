-- CreateIndex
CREATE INDEX "Project_deletedAt_createdAt_idx" ON "Project"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectOrganization_projectId_deletedAt_idx" ON "ProjectOrganization"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "UserOrganization_userId_deletedAt_role_idx" ON "UserOrganization"("userId", "deletedAt", "role");

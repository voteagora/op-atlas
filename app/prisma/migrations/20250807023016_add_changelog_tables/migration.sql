-- CreateTable
CREATE TABLE "UserChangelog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectChangelog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationChangelog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserChangelog_userId_idx" ON "UserChangelog"("userId");

-- CreateIndex
CREATE INDEX "UserChangelog_action_idx" ON "UserChangelog"("action");

-- CreateIndex
CREATE INDEX "UserChangelog_createdAt_idx" ON "UserChangelog"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectChangelog_projectId_idx" ON "ProjectChangelog"("projectId");

-- CreateIndex
CREATE INDEX "ProjectChangelog_action_idx" ON "ProjectChangelog"("action");

-- CreateIndex
CREATE INDEX "ProjectChangelog_createdAt_idx" ON "ProjectChangelog"("createdAt");

-- CreateIndex
CREATE INDEX "ApplicationChangelog_applicationId_idx" ON "ApplicationChangelog"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationChangelog_action_idx" ON "ApplicationChangelog"("action");

-- CreateIndex
CREATE INDEX "ApplicationChangelog_createdAt_idx" ON "ApplicationChangelog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserChangelog" ADD CONSTRAINT "UserChangelog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectChangelog" ADD CONSTRAINT "ProjectChangelog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationChangelog" ADD CONSTRAINT "ApplicationChangelog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

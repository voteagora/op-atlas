-- Create ProjectBlacklist table
CREATE TABLE "ProjectBlacklist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectBlacklist_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint to prevent duplicate blacklist entries
CREATE UNIQUE INDEX "ProjectBlacklist_projectId_key" ON "ProjectBlacklist"("projectId");

-- Add foreign key constraint
ALTER TABLE "ProjectBlacklist" ADD CONSTRAINT "ProjectBlacklist_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index for efficient lookups
CREATE INDEX "ProjectBlacklist_projectId_idx" ON "ProjectBlacklist"("projectId"); 
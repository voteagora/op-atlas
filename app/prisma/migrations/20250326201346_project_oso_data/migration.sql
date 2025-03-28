-- CreateTable
CREATE TABLE "projectOSOData" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "osoId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "projectOSOData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projectOSOData_projectId_idx" ON "projectOSOData"("projectId");

-- CreateIndex
CREATE INDEX "projectOSOData_osoId_idx" ON "projectOSOData"("osoId");

-- AddForeignKey
ALTER TABLE "projectOSOData" ADD CONSTRAINT "projectOSOData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

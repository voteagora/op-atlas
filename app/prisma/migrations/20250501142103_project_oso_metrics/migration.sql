-- CreateEnum
CREATE TYPE "ProjectOSOMetric" AS ENUM ('TVL', 'GAS_FEES', 'ACTIVE_ADDRESSES_COUNT', 'TRANSACTION_COUNT', 'HAS_DEFILLAMA_ADAPTER', 'HAS_BUNDLE_BEAR', 'IS_ONCHAIN_BUILDER_ELIGIBLE', 'IS_DEV_TOOLING_ELIGIBLE', 'STAR_COUNT', 'FORK_COUNT', 'NUM_PACKAGES_IN_DEPS_DEV', 'PACKAGE_CONNECTION_COUNT', 'DEVELOPER_CONNECTION_COUNT', 'TRUSTED_DEVELOPER_USERNAME', 'DOWNSTREAM_GAS');

-- CreateTable
CREATE TABLE "ProjectOSOMetrics" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "metric" "ProjectOSOMetric" NOT NULL,
    "tranche" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProjectOSOMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOSORelatedProjects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tranche" INTEGER NOT NULL,
    "osoId" TEXT NOT NULL,

    CONSTRAINT "ProjectOSORelatedProjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOSOAtlasRelatedProjects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tranche" INTEGER NOT NULL,
    "relatedProjectId" TEXT NOT NULL,

    CONSTRAINT "ProjectOSOAtlasRelatedProjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectOSOMetrics_projectId_idx" ON "ProjectOSOMetrics"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOSOMetrics_metric_idx" ON "ProjectOSOMetrics"("metric");

-- CreateIndex
CREATE INDEX "ProjectOSOMetrics_tranche_idx" ON "ProjectOSOMetrics"("tranche");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOSOMetrics_projectId_metric_tranche_key" ON "ProjectOSOMetrics"("projectId", "metric", "tranche");

-- CreateIndex
CREATE INDEX "ProjectOSORelatedProjects_projectId_idx" ON "ProjectOSORelatedProjects"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOSORelatedProjects_osoId_idx" ON "ProjectOSORelatedProjects"("osoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOSORelatedProjects_projectId_tranche_osoId_key" ON "ProjectOSORelatedProjects"("projectId", "tranche", "osoId");

-- CreateIndex
CREATE INDEX "ProjectOSOAtlasRelatedProjects_projectId_idx" ON "ProjectOSOAtlasRelatedProjects"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOSOAtlasRelatedProjects_relatedProjectId_idx" ON "ProjectOSOAtlasRelatedProjects"("relatedProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOSOAtlasRelatedProjects_projectId_tranche_relatedPro_key" ON "ProjectOSOAtlasRelatedProjects"("projectId", "tranche", "relatedProjectId");

-- AddForeignKey
ALTER TABLE "ProjectOSOMetrics" ADD CONSTRAINT "ProjectOSOMetrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSORelatedProjects" ADD CONSTRAINT "ProjectOSORelatedProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSOAtlasRelatedProjects" ADD CONSTRAINT "ProjectOSOAtlasRelatedProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSOAtlasRelatedProjects" ADD CONSTRAINT "ProjectOSOAtlasRelatedProjects_relatedProjectId_fkey" FOREIGN KEY ("relatedProjectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

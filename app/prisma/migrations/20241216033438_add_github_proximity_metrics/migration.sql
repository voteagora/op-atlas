-- CreateTable
CREATE TABLE "GithubProximity" (
    "peer" TEXT NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubProximity_peer_key" ON "GithubProximity"("peer");

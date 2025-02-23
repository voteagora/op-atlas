-- CreateTable
CREATE TABLE "RetroFundingByRound" (
    "id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "OPAtlas_projectId" TEXT,
    "OrgID" TEXT,
    "rpgf2_amount" DOUBLE PRECISION NOT NULL,
    "rpgf3_amount" DOUBLE PRECISION NOT NULL,
    "rpgf4_amount" DOUBLE PRECISION NOT NULL,
    "rpgf5_amount" DOUBLE PRECISION NOT NULL,
    "rpgf6_amount" DOUBLE PRECISION NOT NULL,
    "rpgf2_projectId" TEXT,
    "rpgf3_projectId" TEXT,

    CONSTRAINT "RetroFundingByRound_pkey" PRIMARY KEY ("id")
);

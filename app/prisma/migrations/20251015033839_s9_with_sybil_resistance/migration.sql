-- CreateEnum
CREATE TYPE "CitizenRegistrationStatus" AS ENUM ('PENDING', 'ELIGIBILITY_FAILED', 'VERIFICATION_REQUIRED', 'BLOCKED', 'READY', 'ATTESTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SocialTrustPlatform" AS ENUM ('FARCASTER', 'GITHUB', 'X');

-- AlterTable
ALTER TABLE "UserSafeAddresses" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "priorityEndDate" TIMESTAMP(3),
    "userCitizenLimit" INTEGER,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenSeason" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "type" "citizenCategory" NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "projectId" TEXT,
    "governanceAddress" TEXT,
    "registrationStatus" "CitizenRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationCompletedAt" TIMESTAMP(3),
    "attestationId" TEXT,
    "trustScore" DOUBLE PRECISION,
    "trustBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitizenSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenSeasonEvaluation" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "citizenSeasonId" TEXT,
    "userId" TEXT NOT NULL,
    "wallets" TEXT[],
    "socialProfiles" JSONB NOT NULL,
    "openRankRaw" JSONB,
    "passportRaw" JSONB,
    "combinedScore" DOUBLE PRECISION,
    "outcome" "CitizenRegistrationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenSeasonEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenRankSnapshot" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "platform" "SocialTrustPlatform" NOT NULL,
    "identifier" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "raw" JSONB,
    "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenRankSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorityAttestationSnapshot" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "attestationId" TEXT,
    "address" TEXT NOT NULL,
    "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriorityAttestationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenQualifyingUser" (
    "seasonId" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "CitizenQualifyingUser_pkey" PRIMARY KEY ("seasonId","address")
);

-- CreateTable
CREATE TABLE "CitizenQualifyingChain" (
    "seasonId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "CitizenQualifyingChain_pkey" PRIMARY KEY ("seasonId","organizationId")
);

-- CreateTable
CREATE TABLE "CitizenQualifyingProject" (
    "seasonId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "CitizenQualifyingProject_pkey" PRIMARY KEY ("seasonId","projectId")
);

-- CreateIndex
CREATE INDEX "CitizenSeason_seasonId_type_idx" ON "CitizenSeason"("seasonId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenSeason_seasonId_userId_key" ON "CitizenSeason"("seasonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenSeason_seasonId_organizationId_key" ON "CitizenSeason"("seasonId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenSeason_seasonId_projectId_key" ON "CitizenSeason"("seasonId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenSeason_seasonId_governanceAddress_key" ON "CitizenSeason"("seasonId", "governanceAddress");

-- CreateIndex
CREATE INDEX "CitizenSeasonEvaluation_seasonId_userId_idx" ON "CitizenSeasonEvaluation"("seasonId", "userId");

-- CreateIndex
CREATE INDEX "CitizenSeasonEvaluation_citizenSeasonId_idx" ON "CitizenSeasonEvaluation"("citizenSeasonId");

-- CreateIndex
CREATE INDEX "CitizenSeasonEvaluation_outcome_idx" ON "CitizenSeasonEvaluation"("outcome");

-- CreateIndex
CREATE INDEX "OpenRankSnapshot_seasonId_platform_idx" ON "OpenRankSnapshot"("seasonId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "OpenRankSnapshot_seasonId_platform_identifier_key" ON "OpenRankSnapshot"("seasonId", "platform", "identifier");

-- CreateIndex
CREATE INDEX "PriorityAttestationSnapshot_seasonId_attestationId_idx" ON "PriorityAttestationSnapshot"("seasonId", "attestationId");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityAttestationSnapshot_seasonId_address_key" ON "PriorityAttestationSnapshot"("seasonId", "address");

-- CreateIndex
CREATE INDEX "CitizenQualifyingUser_seasonId_idx" ON "CitizenQualifyingUser"("seasonId");

-- CreateIndex
CREATE INDEX "CitizenQualifyingUser_address_idx" ON "CitizenQualifyingUser"("address");

-- CreateIndex
CREATE INDEX "CitizenQualifyingChain_seasonId_idx" ON "CitizenQualifyingChain"("seasonId");

-- CreateIndex
CREATE INDEX "CitizenQualifyingChain_organizationId_idx" ON "CitizenQualifyingChain"("organizationId");

-- CreateIndex
CREATE INDEX "CitizenQualifyingProject_seasonId_idx" ON "CitizenQualifyingProject"("seasonId");

-- CreateIndex
CREATE INDEX "CitizenQualifyingProject_projectId_idx" ON "CitizenQualifyingProject"("projectId");

-- AddForeignKey
ALTER TABLE "CitizenSeason" ADD CONSTRAINT "CitizenSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeason" ADD CONSTRAINT "CitizenSeason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeason" ADD CONSTRAINT "CitizenSeason_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeason" ADD CONSTRAINT "CitizenSeason_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeasonEvaluation" ADD CONSTRAINT "CitizenSeasonEvaluation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeasonEvaluation" ADD CONSTRAINT "CitizenSeasonEvaluation_citizenSeasonId_fkey" FOREIGN KEY ("citizenSeasonId") REFERENCES "CitizenSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenSeasonEvaluation" ADD CONSTRAINT "CitizenSeasonEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenRankSnapshot" ADD CONSTRAINT "OpenRankSnapshot_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityAttestationSnapshot" ADD CONSTRAINT "PriorityAttestationSnapshot_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenQualifyingUser" ADD CONSTRAINT "CitizenQualifyingUser_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenQualifyingChain" ADD CONSTRAINT "CitizenQualifyingChain_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenQualifyingProject" ADD CONSTRAINT "CitizenQualifyingProject_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

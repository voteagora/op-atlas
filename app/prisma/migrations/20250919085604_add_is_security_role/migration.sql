-- CreateEnum
CREATE TYPE "KYCUserType" AS ENUM ('USER', 'LEGAL_ENTITY');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProjectOSOMetric" AS ENUM ('TVL', 'GAS_FEES', 'ACTIVE_ADDRESSES_COUNT', 'TRANSACTION_COUNT', 'HAS_DEFILLAMA_ADAPTER', 'HAS_BUNDLE_BEAR', 'IS_ONCHAIN_BUILDER_ELIGIBLE', 'IS_DEV_TOOLING_ELIGIBLE', 'STAR_COUNT', 'FORK_COUNT', 'NUM_PACKAGES_IN_DEPS_DEV', 'PACKAGE_CONNECTION_COUNT', 'DEVELOPER_CONNECTION_COUNT', 'TRUSTED_DEVELOPER_USERNAME', 'DOWNSTREAM_GAS');

-- CreateEnum
CREATE TYPE "citizenCategory" AS ENUM ('CHAIN', 'APP', 'USER');

-- CreateEnum
CREATE TYPE "RoleApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PersonaStatus" AS ENUM ('created', 'pending', 'completed', 'failed', 'expired', 'needs_review', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "EmailNotificationType" AS ENUM ('KYCB_STARTED', 'KYCB_REMINDER', 'KYCB_APPROVED');

-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('RETRO_FUNDING', 'AUDIT_GRANT', 'GROWTH_GRANT', 'FOUNDATION_MISSION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "farcasterId" TEXT,
    "imageUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "github" TEXT,
    "notDeveloper" BOOLEAN NOT NULL DEFAULT false,
    "govForumProfileUrl" TEXT,
    "discord" TEXT,
    "privyDid" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishSetupLinkClicked" BOOLEAN NOT NULL DEFAULT false,
    "orgSettingsVisited" BOOLEAN NOT NULL DEFAULT false,
    "profileVisitCount" INTEGER NOT NULL DEFAULT 0,
    "viewProfileClicked" BOOLEAN NOT NULL DEFAULT false,
    "homePageViewCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteracted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("address","userId")
);

-- CreateTable
CREATE TABLE "UserPassport" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "score" DECIMAL(10,3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPassport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingRound" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewards" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingReward" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardClaim" (
    "rewardId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "address" TEXT,
    "addressSetAt" TIMESTAMP(3),
    "addressSetById" TEXT,
    "tokenStreamStatus" TEXT,
    "tokenStreamClaimableAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kycStatus" TEXT,
    "kycStatusUpdatedAt" TIMESTAMP(3),
    "grantEligibilityUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("rewardId")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "website" TEXT[],
    "farcaster" TEXT[],
    "twitter" TEXT,
    "mirror" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSnapshot" (
    "id" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOrganization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ProjectOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "thumbnailUrl" TEXT,
    "bannerUrl" TEXT,
    "website" TEXT[],
    "farcaster" TEXT[],
    "twitter" TEXT,
    "mirror" TEXT,
    "openSourceObserverSlug" TEXT,
    "addedTeamMembers" BOOLEAN NOT NULL DEFAULT false,
    "addedFunding" BOOLEAN NOT NULL DEFAULT false,
    "lastMetadataUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "hasCodeRepositories" BOOLEAN NOT NULL DEFAULT true,
    "isOnChainContract" BOOLEAN NOT NULL DEFAULT true,
    "pricingModel" TEXT,
    "pricingModelDetails" TEXT,
    "isSubmittedToOso" BOOLEAN NOT NULL DEFAULT false,
    "defiLlamaSlug" TEXT[],
    "kycTeamId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBlacklist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "attestationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roundId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT,
    "projectDescriptionOptions" TEXT[],

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "roundId" TEXT,
    "isMultipleChoice" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactStatement" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "subtext" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isMarkdownSupported" BOOLEAN NOT NULL DEFAULT true,
    "roundId" TEXT,
    "limitToCategoryOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "selectionOptions" TEXT[],

    CONSTRAINT "ImpactStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactStatementAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "impactStatementId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ImpactStatementAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProjects" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "UserProjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSnapshot" (
    "id" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "attestationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRepository" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "openSource" BOOLEAN NOT NULL DEFAULT false,
    "containsContracts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT,
    "crate" BOOLEAN NOT NULL DEFAULT false,
    "npmPackage" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLinks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContract" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "deployerAddress" TEXT NOT NULL,
    "deploymentHash" TEXT NOT NULL,
    "verificationProof" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT,
    "verificationChainId" INTEGER,

    CONSTRAINT "ProjectContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishedContract" (
    "id" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "deployer" TEXT NOT NULL,
    "deploymentTx" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "verificationChainId" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PublishedContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFunding" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "grant" TEXT,
    "grantUrl" TEXT,
    "amount" TEXT NOT NULL,
    "receivedAt" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "fundingRound" TEXT,

    CONSTRAINT "ProjectFunding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "chain_id" INTEGER,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badgeholder" (
    "address" TEXT NOT NULL,
    "roundId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GithubProximity" (
    "peer" TEXT NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "ContactEmailTags" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactEmailTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "businessName" TEXT,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personaStatus" "PersonaStatus",
    "kycUserType" "KYCUserType" NOT NULL DEFAULT 'USER',

    CONSTRAINT "KYCUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailNotification" (
    "id" TEXT NOT NULL,
    "kycUserId" TEXT NOT NULL,
    "type" "EmailNotificationType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailTo" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCTeam" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCUserTeams" (
    "id" TEXT NOT NULL,
    "kycUserId" TEXT NOT NULL,
    "kycTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCUserTeams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationKYCTeam" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kycTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationKYCTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOSO" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "osoId" TEXT NOT NULL,
    "roundId" TEXT,

    CONSTRAINT "ProjectOSO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectOSOData" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "osoId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "projectOSOData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringReward" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "tranche" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecurringReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperfluidStream" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "flowRate" TEXT NOT NULL,
    "deposit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "internalStreamId" TEXT,

    CONSTRAINT "SuperfluidStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardStream" (
    "id" TEXT NOT NULL,
    "projects" TEXT[],
    "roundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kycTeamId" TEXT NOT NULL,

    CONSTRAINT "RewardStream_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Citizen" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT,
    "type" TEXT NOT NULL,
    "attestationId" TEXT,
    "timeCommitment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "S8QualifyingUser" (
    "address" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingUser_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "S8QualifyingChain" (
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingChain_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "S8QualifyingProject" (
    "projectId" TEXT NOT NULL,

    CONSTRAINT "S8QualifyingProject_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "UserWorldId" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "nullifierHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorldId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "description" TEXT,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "voteStartAt" TIMESTAMP(3),
    "voteEndAt" TIMESTAMP(3),
    "endorsementStartAt" TIMESTAMP(3),
    "endorsementEndAt" TIMESTAMP(3),
    "isSecurityRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposalId" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleApplication" (
    "id" SERIAL NOT NULL,
    "status" "RoleApplicationStatus" NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "application" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantEligibility" (
    "id" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "grantType" "GrantType",
    "walletAddress" TEXT,
    "attestations" JSONB,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "projectId" TEXT,
    "organizationId" TEXT,
    "kycTeamId" TEXT,

    CONSTRAINT "GrantEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantEligibilityChangelog" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrantEligibilityChangelog_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "nomineeApplicationId" INTEGER NOT NULL,
    "endorserAddress" TEXT NOT NULL,
    "endorserUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_farcasterId_key" ON "User"("farcasterId");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_farcasterId_idx" ON "User"("farcasterId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmail_email_key" ON "UserEmail"("email");

-- CreateIndex
CREATE INDEX "UserEmail_userId_idx" ON "UserEmail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInteraction_userId_key" ON "UserInteraction"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAddress_address_key" ON "UserAddress"("address");

-- CreateIndex
CREATE INDEX "UserAddress_userId_idx" ON "UserAddress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPassport_address_key" ON "UserPassport"("address");

-- CreateIndex
CREATE INDEX "UserPassport_userId_idx" ON "UserPassport"("userId");

-- CreateIndex
CREATE INDEX "FundingReward_projectId_idx" ON "FundingReward"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingReward_roundId_projectId_key" ON "FundingReward"("roundId", "projectId");

-- CreateIndex
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");

-- CreateIndex
CREATE INDEX "OrganizationSnapshot_organizationId_idx" ON "OrganizationSnapshot"("organizationId");

-- CreateIndex
CREATE INDEX "UserOrganization_organizationId_idx" ON "UserOrganization"("organizationId");

-- CreateIndex
CREATE INDEX "UserOrganization_userId_deletedAt_role_idx" ON "UserOrganization"("userId", "deletedAt", "role");

-- CreateIndex
CREATE INDEX "UserOrganization_deletedAt_idx" ON "UserOrganization"("deletedAt");

-- CreateIndex
CREATE INDEX "UserOrganization_userId_idx" ON "UserOrganization"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganization_userId_organizationId_key" ON "UserOrganization"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOrganization_projectId_key" ON "ProjectOrganization"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOrganization_organizationId_idx" ON "ProjectOrganization"("organizationId");

-- CreateIndex
CREATE INDEX "ProjectOrganization_projectId_deletedAt_idx" ON "ProjectOrganization"("projectId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOrganization_projectId_organizationId_key" ON "ProjectOrganization"("projectId", "organizationId");

-- CreateIndex
CREATE INDEX "Project_deletedAt_createdAt_idx" ON "Project"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBlacklist_projectId_key" ON "ProjectBlacklist"("projectId");

-- CreateIndex
CREATE INDEX "ProjectBlacklist_projectId_idx" ON "ProjectBlacklist"("projectId");

-- CreateIndex
CREATE INDEX "Application_projectId_idx" ON "Application"("projectId");

-- CreateIndex
CREATE INDEX "Application_roundId_idx" ON "Application"("roundId");

-- CreateIndex
CREATE INDEX "Application_categoryId_idx" ON "Application"("categoryId");

-- CreateIndex
CREATE INDEX "ImpactStatement_categoryId_idx" ON "ImpactStatement"("categoryId");

-- CreateIndex
CREATE INDEX "ImpactStatementAnswer_applicationId_impactStatementId_idx" ON "ImpactStatementAnswer"("applicationId", "impactStatementId");

-- CreateIndex
CREATE INDEX "UserProjects_userId_deletedAt_idx" ON "UserProjects"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "UserProjects_projectId_deletedAt_idx" ON "UserProjects"("projectId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProjects_userId_projectId_key" ON "UserProjects"("userId", "projectId");

-- CreateIndex
CREATE INDEX "ProjectSnapshot_projectId_idx" ON "ProjectSnapshot"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRepository_url_key" ON "ProjectRepository"("url");

-- CreateIndex
CREATE INDEX "ProjectRepository_projectId_idx" ON "ProjectRepository"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLinks_projectId_idx" ON "ProjectLinks"("projectId");

-- CreateIndex
CREATE INDEX "ProjectContract_projectId_idx" ON "ProjectContract"("projectId");

-- CreateIndex
CREATE INDEX "ProjectContract_deployerAddress_idx" ON "ProjectContract"("deployerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectContract_contractAddress_chainId_key" ON "ProjectContract"("contractAddress", "chainId");

-- CreateIndex
CREATE INDEX "ProjectFunding_projectId_idx" ON "ProjectFunding"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "api_users_api_key_key" ON "api_users"("api_key");

-- CreateIndex
CREATE INDEX "api_users_api_key_idx" ON "api_users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "Badgeholder_address_roundId_key" ON "Badgeholder"("address", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "GithubProximity_peer_key" ON "GithubProximity"("peer");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEmailTags_email_key" ON "ContactEmailTags"("email");

-- CreateIndex
CREATE INDEX "ContactEmailTags_email_idx" ON "ContactEmailTags"("email");

-- CreateIndex
CREATE INDEX "KYCUser_email_idx" ON "KYCUser"("email");

-- CreateIndex
CREATE INDEX "EmailNotification_kycUserId_idx" ON "EmailNotification"("kycUserId");

-- CreateIndex
CREATE INDEX "EmailNotification_type_idx" ON "EmailNotification"("type");

-- CreateIndex
CREATE INDEX "EmailNotification_sentAt_idx" ON "EmailNotification"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "KYCTeam_walletAddress_key" ON "KYCTeam"("walletAddress");

-- CreateIndex
CREATE INDEX "KYCTeam_walletAddress_idx" ON "KYCTeam"("walletAddress");

-- CreateIndex
CREATE INDEX "KYCUserTeams_kycUserId_idx" ON "KYCUserTeams"("kycUserId");

-- CreateIndex
CREATE INDEX "KYCUserTeams_kycTeamId_idx" ON "KYCUserTeams"("kycTeamId");

-- CreateIndex
CREATE INDEX "OrganizationKYCTeam_organizationId_idx" ON "OrganizationKYCTeam"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationKYCTeam_kycTeamId_idx" ON "OrganizationKYCTeam"("kycTeamId");

-- CreateIndex
CREATE INDEX "ProjectOSO_projectId_idx" ON "ProjectOSO"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOSO_osoId_idx" ON "ProjectOSO"("osoId");

-- CreateIndex
CREATE INDEX "projectOSOData_projectId_idx" ON "projectOSOData"("projectId");

-- CreateIndex
CREATE INDEX "projectOSOData_osoId_idx" ON "projectOSOData"("osoId");

-- CreateIndex
CREATE INDEX "RecurringReward_projectId_idx" ON "RecurringReward"("projectId");

-- CreateIndex
CREATE INDEX "RecurringReward_roundId_idx" ON "RecurringReward"("roundId");

-- CreateIndex
CREATE INDEX "RecurringReward_tranche_idx" ON "RecurringReward"("tranche");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringReward_roundId_tranche_projectId_key" ON "RecurringReward"("roundId", "tranche", "projectId");

-- CreateIndex
CREATE INDEX "SuperfluidStream_sender_idx" ON "SuperfluidStream"("sender");

-- CreateIndex
CREATE INDEX "SuperfluidStream_receiver_idx" ON "SuperfluidStream"("receiver");

-- CreateIndex
CREATE INDEX "SuperfluidStream_internalStreamId_idx" ON "SuperfluidStream"("internalStreamId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperfluidStream_sender_receiver_key" ON "SuperfluidStream"("sender", "receiver");

-- CreateIndex
CREATE INDEX "RewardStream_roundId_idx" ON "RewardStream"("roundId");

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

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_userId_key" ON "Citizen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_address_key" ON "Citizen"("address");

-- CreateIndex
CREATE INDEX "Citizen_userId_idx" ON "Citizen"("userId");

-- CreateIndex
CREATE INDEX "Citizen_projectId_idx" ON "Citizen"("projectId");

-- CreateIndex
CREATE INDEX "Citizen_organizationId_idx" ON "Citizen"("organizationId");

-- CreateIndex
CREATE INDEX "S8QualifyingUser_address_idx" ON "S8QualifyingUser"("address");

-- CreateIndex
CREATE INDEX "S8QualifyingChain_organizationId_idx" ON "S8QualifyingChain"("organizationId");

-- CreateIndex
CREATE INDEX "S8QualifyingProject_projectId_idx" ON "S8QualifyingProject"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorldId_userId_key" ON "UserWorldId"("userId");

-- CreateIndex
CREATE INDEX "UserWorldId_userId_idx" ON "UserWorldId"("userId");

-- CreateIndex
CREATE INDEX "RoleApplication_roleId_idx" ON "RoleApplication"("roleId");

-- CreateIndex
CREATE INDEX "RoleApplication_userId_idx" ON "RoleApplication"("userId");

-- CreateIndex
CREATE INDEX "RoleApplication_organizationId_idx" ON "RoleApplication"("organizationId");

-- CreateIndex
CREATE INDEX "GrantEligibility_projectId_idx" ON "GrantEligibility"("projectId");

-- CreateIndex
CREATE INDEX "GrantEligibility_organizationId_idx" ON "GrantEligibility"("organizationId");

-- CreateIndex
CREATE INDEX "GrantEligibility_kycTeamId_idx" ON "GrantEligibility"("kycTeamId");

-- CreateIndex
CREATE INDEX "GrantEligibility_createdAt_idx" ON "GrantEligibility"("createdAt");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_formId_idx" ON "GrantEligibilityChangelog"("formId");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_action_idx" ON "GrantEligibilityChangelog"("action");

-- CreateIndex
CREATE INDEX "GrantEligibilityChangelog_createdAt_idx" ON "GrantEligibilityChangelog"("createdAt");

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

-- CreateIndex
CREATE INDEX "Endorsement_context_nomineeApplicationId_idx" ON "Endorsement"("context", "nomineeApplicationId");

-- CreateIndex
CREATE INDEX "Endorsement_endorserAddress_idx" ON "Endorsement"("endorserAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_context_nomineeApplicationId_endorserAddress_key" ON "Endorsement"("context", "nomineeApplicationId", "endorserAddress");

-- AddForeignKey
ALTER TABLE "UserEmail" ADD CONSTRAINT "UserEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPassport" ADD CONSTRAINT "UserPassport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingReward" ADD CONSTRAINT "FundingReward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingReward" ADD CONSTRAINT "FundingReward_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_addressSetById_fkey" FOREIGN KEY ("addressSetById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "FundingReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSnapshot" ADD CONSTRAINT "OrganizationSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOrganization" ADD CONSTRAINT "ProjectOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOrganization" ADD CONSTRAINT "ProjectOrganization_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBlacklist" ADD CONSTRAINT "ProjectBlacklist_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatement" ADD CONSTRAINT "ImpactStatement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatement" ADD CONSTRAINT "ImpactStatement_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStatementAnswer" ADD CONSTRAINT "ImpactStatementAnswer_impactStatementId_fkey" FOREIGN KEY ("impactStatementId") REFERENCES "ImpactStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProjects" ADD CONSTRAINT "UserProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProjects" ADD CONSTRAINT "UserProjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSnapshot" ADD CONSTRAINT "ProjectSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRepository" ADD CONSTRAINT "ProjectRepository_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLinks" ADD CONSTRAINT "ProjectLinks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContract" ADD CONSTRAINT "ProjectContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedContract" ADD CONSTRAINT "PublishedContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFunding" ADD CONSTRAINT "ProjectFunding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailNotification" ADD CONSTRAINT "EmailNotification_kycUserId_fkey" FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCUserTeams" ADD CONSTRAINT "KYCUserTeams_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCUserTeams" ADD CONSTRAINT "KYCUserTeams_kycUserId_fkey" FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationKYCTeam" ADD CONSTRAINT "OrganizationKYCTeam_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationKYCTeam" ADD CONSTRAINT "OrganizationKYCTeam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSO" ADD CONSTRAINT "ProjectOSO_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectOSOData" ADD CONSTRAINT "projectOSOData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringReward" ADD CONSTRAINT "RecurringReward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringReward" ADD CONSTRAINT "RecurringReward_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperfluidStream" ADD CONSTRAINT "SuperfluidStream_internalStreamId_fkey" FOREIGN KEY ("internalStreamId") REFERENCES "RewardStream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperfluidStream" ADD CONSTRAINT "SuperfluidStream_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "KYCTeam"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardStream" ADD CONSTRAINT "RewardStream_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardStream" ADD CONSTRAINT "RewardStream_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "FundingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSOMetrics" ADD CONSTRAINT "ProjectOSOMetrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSORelatedProjects" ADD CONSTRAINT "ProjectOSORelatedProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSOAtlasRelatedProjects" ADD CONSTRAINT "ProjectOSOAtlasRelatedProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOSOAtlasRelatedProjects" ADD CONSTRAINT "ProjectOSOAtlasRelatedProjects_relatedProjectId_fkey" FOREIGN KEY ("relatedProjectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorldId" ADD CONSTRAINT "UserWorldId_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_kycTeamId_fkey" FOREIGN KEY ("kycTeamId") REFERENCES "KYCTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibility" ADD CONSTRAINT "GrantEligibility_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantEligibilityChangelog" ADD CONSTRAINT "GrantEligibilityChangelog_formId_fkey" FOREIGN KEY ("formId") REFERENCES "GrantEligibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChangelog" ADD CONSTRAINT "UserChangelog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectChangelog" ADD CONSTRAINT "ProjectChangelog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationChangelog" ADD CONSTRAINT "ApplicationChangelog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_nomineeApplicationId_fkey" FOREIGN KEY ("nomineeApplicationId") REFERENCES "RoleApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserUserId_fkey" FOREIGN KEY ("endorserUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

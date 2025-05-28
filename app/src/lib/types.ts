import { Prisma, User } from "@prisma/client"
import { AggregatedType } from "eas-indexer/src/types"
import { TENANT_NAMESPACES } from "@/lib/constants"

export type TeamRole = "member" | "admin"

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    team: { include: { user: true } }
    organization: {
      include: {
        organization: { include: { team: { include: { user: true } } } }
      }
    }
    snapshots: true
    applications: true
    rewards: { include: { claim: true } }
  }
}>

export type ProjectWithReward = Prisma.ProjectGetPayload<{
  include: {
    id: true
    name: true
    description: true
    thumbnailUrl: true
    rewards: {
      select: {
        id: true
        amount: true
      }
    }
  }
}>

export type ProjectTeam = {
  id: string
  role: TeamRole
  projectId?: string
  organizationId?: string
  user: User
}[]

export type ProjectContracts = Prisma.ProjectGetPayload<{
  include: {
    contracts: true
    publishedContracts: true
  }
}>

export type ProjectWithFullDetails = Prisma.ProjectGetPayload<{
  include: {
    organization: {
      include: {
        organization: true
      }
    }
    repos: true
    links: true
    funding: true
    snapshots: true
    applications: {
      include: {
        category: {
          include: {
            impactStatements: true
          }
        }
        impactStatementAnswer: true
        round: true
      }
    }
    rewards: {
      include: {
        claim: true
      }
    }
  }
}>

export type UserProjectsWithDetails = {
  projects: {
    project: ProjectWithDetails
  }[]
  organizations: {
    organization: {
      projects: {
        project: ProjectWithDetails
      }[]
    }
  }[]
}

export type PublishedUserProjectsResult = {
  projects: Array<{
    project: ProjectWithDetailsLite
  }>
  organizations: Array<{
    organization: {
      projects: Array<{
        project: ProjectWithDetailsLite
      }>
    }
  }>
}

export type ProjectWithDetailsLite = Prisma.ProjectGetPayload<{
  include: {
    funding: true
    snapshots: true
    applications: true
    links: true
    rewards: { include: { claim: true } }
  }
}>

export type ProjectWithDetailsWithoutOrganization = Prisma.ProjectGetPayload<{
  include: {
    team: { include: { user: true } }
    repos: true
    contracts: true
    funding: true
    snapshots: true
    applications: true
    rewards: { include: { claim: true } }
  }
}>

export type ProjectWithTeam = Prisma.ProjectGetPayload<{
  include: {
    team: true
  }
}>

export type ProjectContractWithProject = Prisma.ProjectContractGetPayload<{
  include: {
    project: true
  }
}>

export type KYCTeamWithTeam = Prisma.KYCTeamGetPayload<{
  include: {
    team: {
      select: {
        users: true
      }
    }
    rewardStreams: true
  }
}>

export type KYCStreamTeam = Prisma.KYCTeamGetPayload<{
  include: {
    team: {
      include: {
        users: true
      }
    }
    rewardStreams: true
    projects: {
      select: {
        id: true
        name: true
        recurringRewards: true
      }
    }
  }
}>

export type StreamWithKYCTeam = Prisma.SuperfluidStreamGetPayload<{
  include: {
    kycTeam: true
  }
}>

export type RewardWithClaim = Prisma.FundingRewardGetPayload<{
  include: { claim: true }
}>

export type RecurringRewardWithProject = Prisma.RecurringRewardGetPayload<{
  include: {
    project: {
      include: {
        kycTeam: {
          include: {
            superfludStream: true
            team: {
              select: {
                users: true
              }
            }
            rewardStreams: {
              include: {
                streams: true
              }
            }
          }
        }
      }
    }
  }
}>

export type UserWithProjects = Prisma.UserGetPayload<{
  select: {
    projects: {
      where: {
        deletedAt: null
        project: {
          deletedAt: null
        }
      }
      include: {
        project: true
      }
    }
  }
}>

export type UserWithAddresses = Prisma.UserGetPayload<{
  include: {
    addresses: true
    interaction: true
    emails: true
  }
}>

export type UserAddressSource = "farcaster" | "atlas" | "privy"

export type UserWithEmails = Prisma.UserGetPayload<{
  include: {
    emails: true
  }
}>

export type RewardWithProject = Prisma.FundingRewardGetPayload<{
  include: {
    claim: {
      include: {
        addressSetBy: true
      }
    }
    project: {
      include: {
        team: {
          include: {
            user: true
          }
        }
      }
    }
  }
}>

export type FundingRewardDetails = Prisma.FundingRewardGetPayload<{
  select: {
    id: true
    roundId: true
    amount: true
    createdAt: true
    updatedAt: true
    project: {
      select: {
        id: true
        name: true
        description: true
        thumbnailUrl: true
        website: true
      }
    }
    claim: {
      select: {
        status: true
        address: true
      }
    }
  }
}>

export type OrganizationWithDetails = Prisma.OrganizationGetPayload<{
  include: {
    team: { include: { user: true } }
    projects: true
  }
}>

export type UserOrganizationsWithDetails = Prisma.UserOrganizationGetPayload<{
  include: {
    organization: {
      include: {
        team: {
          include: {
            user: true
          }
          where: {
            deletedAt: null
          }
        }
        projects: {
          include: {
            project: {
              include: {
                team: { include: { user: true } }
                repos: true
                contracts: true
                funding: true
                snapshots: true
                applications: true
                rewards: { include: { claim: true } }
              }
            }
          }
          where: {
            deletedAt: null
          }
        }
      }
    }
  }
}>

export type OrganizationWithTeamAndProjects = Prisma.OrganizationGetPayload<{
  include: {
    team: {
      include: {
        user: true
      }
      where: {
        deletedAt: null
      }
    }
    projects: {
      include: {
        project: {
          include: {
            funding: true
            snapshots: true
            applications: true
            links: true
            rewards: { include: { claim: true } }
          }
        }
      }
      where: {
        deletedAt: null
      }
    }
  }
}>

export type ApplicationWithDetails = Prisma.ApplicationGetPayload<{
  include: {
    impactStatementAnswer: true
    project: true
    projectDescriptionOptions: true
    round: true
  }
}>

export type CategoryWithImpact = Prisma.CategoryGetPayload<{
  include: {
    impactStatements: true
  }
}>

export type OsoDeployerContracts = {
  contractNamespace: string
  contractAddress: string
  rootDeployerAddress: string
}

export type OsoDeployerContractsReturnType = {
  oso_contractsV0: Array<OsoDeployerContracts>
}

export type ParsedOsoDeployerContract = {
  contractAddress: string
  chainId: number
  rootDeployerAddress: string
}

export interface ProjectContractsByDeployer {
  address: string
  contracts: Array<{ address: string; chainId: number }>
}

export type ExtendedAggregatedType = AggregatedType & {
  contributors: { address: string; email?: string }[]
  github_repo_builders: { address: string; email?: string }[]
}

export interface PassportScore {
  score: string
  passing_score: boolean
  last_score_timestamp: string
  expiration_timestamp: string
  threshold: string
}

export interface CitizenshipQualification {
  type: string
  identifier: string
  title: string
  avatar: string | null
}

export type TenantNamespace =
  (typeof TENANT_NAMESPACES)[keyof typeof TENANT_NAMESPACES]

export type TenantToken = {
  name: string
  symbol: string
  decimals: number
  address: string
}

export enum ProposalStage {
  DRAFTING = "drafting",
  AWAITING_SUBMISSION = "awaiting_submission",
  PENDING = "pending",
  QUEUED = "queued",
  EXECUTED = "executed",
}

type TenantProposalLifecycleStage = {
  stage: ProposalStage
  order: number
  isPreSubmission: boolean
  config?: any
}

export enum ProposalGatingType {
  MANAGER = "manager",
  TOKEN_THRESHOLD = "token threshold",
  GOVERNOR_V1 = "governor v1",
}

export type PLMConfig = {
  // the stages of the proposal lifecycle that
  // this tenant wants to use
  stages: TenantProposalLifecycleStage[]
  // We can read proposal type from the governor
  // but others might be desired, like snapshot
  proposalTypes: any[]
  // custom copy for the proposal lifecycle feature
  copy: any
  // optional config for including snapshot as a proposal type
  snapshotConfig?: {
    domain: string
    requiredTokens: number
  }
  // The method for gating who can create a proposal
  // Manager -- only the manager can create proposals
  // Token Threshold -- a certain amount of tokens must be held
  // OZ (ENS, UNI): Token threshold
  // Agora gov 0.1 (OP): manager
  // Agora gov 1.0+ (everyone else): manager or voting threshold
  gatingType: ProposalGatingType
  // Whether to show the create proposal button conditionally with a check
  protocolLevelCreateProposalButtonCheck?: boolean
}

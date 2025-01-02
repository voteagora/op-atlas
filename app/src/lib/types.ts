import { Prisma } from "@prisma/client"

export type TeamRole = "member" | "admin"

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    team: { include: { user: true } }
    organization: {
      include: {
        organization: { include: { team: { include: { user: true } } } }
      }
    }
    repos: true
    contracts: true
    funding: true
    snapshots: true
    applications: true
    links: true
    rewards: { include: { claim: true } }
  }
}>

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

export type RewardWithClaim = Prisma.FundingRewardGetPayload<{
  include: { claim: true }
}>

export type UserWithAddresses = Prisma.UserGetPayload<{
  include: {
    addresses: true
    interaction: true
    emails: true
  }
}>

export type UserAddressSource = "farcaster" | "atlas"

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

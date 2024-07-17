import { Prisma } from "@prisma/client"

export type TeamRole = "member" | "admin"

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
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

export type UserWithAddresses = Prisma.UserGetPayload<{
  include: {
    addresses: true
  }
}>

export type UserAddressSource = "farcaster" | "atlas"

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

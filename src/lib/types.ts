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
  }
}>

export type UserWithAddresses = Prisma.UserGetPayload<{
  include: {
    addresses: true
  }
}>

export type UserAddressSource = "farcaster" | "atlas"

export type FundingRewardDetails = Prisma.FundingRewardGetPayload<{
  select: {
    id: true
    amount: true
    createdAt: true
    updatedAt: true
    Project: {
      select: {
        id: true
        name: true
        description: true
        thumbnailUrl: true
      }
    }
    FundingRound: true
    RewardClaim: {
      select: {
        status: true
        address: true
      }
    }
  }
}>

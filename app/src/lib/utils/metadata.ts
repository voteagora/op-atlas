import { ProjectContract } from "@prisma/client"
import { z } from "zod"

import {
  CategoryWithImpact,
  OrganizationWithDetails,
  ProjectWithDetails,
} from "../types"

export const FullProjectMetadataValidator = z.object({
  name: z.string(),
  description: z.string().nullable().default(null),
  projectAvatarUrl: z.string().nullable().default(null),
  projectCoverImageUrl: z.string().nullable().default(null),
  category: z.string().nullable().default(null),
  osoSlug: z.string().nullable().default(null),
  socialLinks: z.object({
    website: z.array(z.string()),
    farcaster: z.array(z.string()),
    twitter: z.string().nullable().default(null),
    mirror: z.string().nullable().default(null),
  }),
  team: z.array(z.string()),
  github: z.array(z.string()),
  packages: z.array(z.string()),
  contracts: z.array(
    z.object({
      address: z.string(),
      deploymentTxHash: z.string(),
      deployerAddress: z.string(),
      verificationProof: z.string().nullable().default(null),
      chainId: z.number().min(1),
    }),
  ),
  grantsAndFunding: z.object({
    ventureFunding: z.array(
      z.object({
        amount: z.string(),
        year: z.string(),
        details: z.string().nullable().default(null),
      }),
    ),
    grants: z.array(
      z.object({
        grant: z.string().nullable().default(null),
        link: z.string().nullable().default(null),
        amount: z.string(),
        date: z.string(),
        details: z.string().nullable().default(null),
      }),
    ),
    revenue: z.array(
      z.object({
        amount: z.string(),
        details: z.string().nullable().default(null),
      }),
    ),
  }),
  pricingModel: z.string().nullable().default(null),
  pricingModelDetails: z.string().nullable().default(null),
  links: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().nullable().default(null),
        description: z.string().nullable().default(null),
      }),
    )
    .optional()
    .default([]),
})

export type FullProjectMetadata = {
  name: string
  description: string | null
  projectAvatarUrl: string | null
  projectCoverImageUrl: string | null
  category: string | null
  osoSlug: string | null
  socialLinks: {
    website: string[]
    farcaster: string[]
    twitter: string | null
    mirror: string | null
  }
  team: string[]
  github: {
    url: string
    name: string | null
    description: string | null
  }[]
  packages: {
    url: string
    name: string | null
    description: string | null
  }[]
  contracts: {
    address: string
    deploymentTxHash: string
    deployerAddress: string
    verificationProof: string | null
    chainId: number
  }[]
  grantsAndFunding: {
    ventureFunding: {
      amount: string
      year: string
      details: string | null
    }[]
    grants: {
      grant: string | null
      link: string | null
      amount: string
      date: string
      details: string | null
    }[]
    revenue: {
      amount: string
      details: string | null
    }[]
  }
  pricingModel: string | null
  pricingModelDetails: string | null
  links: {
    url: string
    name: string | null
    description: string | null
  }[]
}

export type ProjectMetadata = Omit<FullProjectMetadata, "contracts">

export function formatProjectMetadata(
  project: ProjectWithDetails,
): ProjectMetadata {
  // Eliminate extraneous data from IPFS snapshots

  const team = project.team.map(({ user }) => user.farcasterId)
  const github = project.repos
    .filter((repo) => repo.type === "github")
    .map((repo) => {
      return {
        url: repo.url,
        name: repo.name,
        description: repo.description,
      }
    })
  const packages = project.repos
    .filter((repo) => repo.type === "package")
    .map((repo) => {
      return {
        url: repo.url,
        name: repo.name,
        description: repo.description,
      }
    })

  const investments = project.funding
    .filter((funding) => funding.type === "venture")
    .map((funding) => ({
      amount: funding.amount,
      year: funding.receivedAt,
      details: funding.details,
    }))
  const revenue = project.funding
    .filter((funding) => funding.type === "revenue")
    .map((funding) => ({
      amount: funding.amount,
      details: funding.details,
    }))
  const retroFunding = project.funding
    .filter((funding) => funding.type === "retroFunding")
    .map((funding) => ({
      grant: "retroFunding",
      link: funding.grantUrl,
      amount: funding.amount,
      date: funding.receivedAt,
      details: "Round " + funding.fundingRound,
    }))
  const grants = project.funding
    .filter(
      (funding) =>
        funding.type !== "venture" &&
        funding.type !== "revenue" &&
        funding.type !== "retroFunding",
    )
    .map((funding) => ({
      grant: funding.grant,
      link: funding.grantUrl,
      amount: funding.amount,
      date: funding.receivedAt,
      details: funding.details,
    }))

  const metadata = {
    name: project.name,
    description: project.description,
    projectAvatarUrl: project.thumbnailUrl,
    projectCoverImageUrl: project.bannerUrl,
    category: project.category,
    osoSlug: project.openSourceObserverSlug,
    socialLinks: {
      website: project.website,
      farcaster: project.farcaster,
      twitter: project.twitter,
      mirror: project.mirror,
    },
    team,
    github,
    packages,
    grantsAndFunding: {
      ventureFunding: investments,
      grants,
      revenue,
      retroFunding,
    },
    pricingModel: project.pricingModel,
    pricingModelDetails: project.pricingModelDetails,
    links: project.links.map((link) => ({
      url: link.url,
      name: link.name,
      description: link.description,
    })),
  }

  return metadata
}

export function buildFullProjectMetadata(
  project: ProjectWithDetails,
  contracts: ProjectContract[],
): FullProjectMetadata {
  const metadata = formatProjectMetadata(project)
  return {
    ...metadata,
    contracts: contracts.map((contract) => ({
      address: contract.contractAddress,
      deploymentTxHash: contract.deploymentHash,
      deployerAddress: contract.deployerAddress,
      verificationProof: contract.verificationProof,
      chainId: contract.chainId,
    })),
  }
}

export type OrganizationMetadata = {
  name: string
  description: string | null
  organizationAvatarUrl: string | null
  organizationCoverImageUrl: string | null
  socialLinks: {
    website: string[]
    farcaster: string[]
    twitter: string | null
    mirror: string | null
  }
  team: string[]
}

export function formatOrganizationMetadata(
  organization: OrganizationWithDetails,
): OrganizationMetadata {
  // Eliminate extraneous data from IPFS snapshots

  const team = organization.team.map(({ user }) => user.farcasterId)

  const metadata = {
    name: organization.name,
    description: organization.description,
    organizationAvatarUrl: organization.avatarUrl,
    organizationCoverImageUrl: organization.coverUrl,
    socialLinks: {
      website: organization.website,
      farcaster: organization.farcaster,
      twitter: organization.twitter,
      mirror: organization.mirror,
    },
    team,
  }

  return metadata
}

export type ApplicationMetadata = {
  round: number
  category?: string
  subcategory: string[]
  impactStatement: {
    question: string
    answer: string
  }[]
}

export function formatApplicationMetadata({
  round,
  categoryId,
  impactStatement,
  category,
  projectDescriptionOptions,
}: {
  round: number
  categoryId: string
  impactStatement: Record<string, string>
  category?: CategoryWithImpact
  projectDescriptionOptions: string[]
}): ApplicationMetadata {
  const metadata = {
    round: round,
    category: category?.name,
    subcategory: projectDescriptionOptions,
    impactStatement: impactStatement
      ? Object.entries(impactStatement).map(([id, answer]) => ({
          question:
            category?.impactStatements.find((i) => i.id === id)?.question ?? "",
          answer,
        }))
      : [],
  }

  return metadata
}

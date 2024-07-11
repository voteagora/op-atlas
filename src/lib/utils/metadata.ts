import { ProjectWithDetails } from "../types"

export type ProjectMetadata = {
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
  github: string[]
  packages: string[]
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
}

export function formatProjectMetadata(
  project: ProjectWithDetails,
): ProjectMetadata {
  // Eliminate extraneous data from IPFS snapshots

  const team = project.team.map(({ user }) => user.farcasterId)
  const github = project.repos
    .filter((repo) => repo.type === "github")
    .map((repo) => repo.url)
  const packages = project.repos
    .filter((repo) => repo.type === "package")
    .map((repo) => repo.url)

  const contracts = project.contracts.map((contract) => ({
    address: contract.contractAddress,
    deploymentTxHash: contract.deploymentHash,
    deployerAddress: contract.deployerAddress,
    verificationProof: contract.verificationProof,
    chainId: contract.chainId,
  }))

  const venture = project.funding
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
  const grants = project.funding
    .filter(
      (funding) => funding.type !== "venture" && funding.type !== "revenue",
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
    contracts,
    grantsAndFunding: {
      ventureFunding: venture,
      grants,
      revenue,
    },
  }

  return metadata
}

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getProject } from "@/db/projects"
import { createProjectSnapshotOnBehalf } from "@/lib/actions/snapshots"
import { formatProjectMetadata } from "@/lib/utils/metadata"
import { authenticateApiUser } from "@/serverAuth"

const ProjectMetadataValidator = z.object({
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
  links: z.array(
    z.object({
      url: z.string(),
      name: z.string().nullable().default(null),
      description: z.string().nullable().default(null),
    }),
  ),
})

export const POST = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  const { projectId } = route.params
  const { farcasterId, metadata } = await req.json()

  const { ipfsHash, attestationId } = await createProjectSnapshotOnBehalf(
    ProjectMetadataValidator.parse(metadata),
    projectId,
    z.string().parse(farcasterId),
  )

  return NextResponse.json({ ipfsHash, attestationId, projectId })
}

export const GET = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  const { projectId } = route.params

  const project = await getProject({ id: projectId })

  if (!project) {
    return new Response("Project not found", { status: 404 })
  }

  const metadata = formatProjectMetadata(project)

  return NextResponse.json({
    metadata,
    projectId,
    projectMetadataId:
      project.snapshots[project.snapshots.length - 1].attestationId,
  })
}

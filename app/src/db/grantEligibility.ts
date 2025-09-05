import { prisma } from "./client"

export function getGrantEligibilityExpiration(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
}

export async function getLatestDraftForm(params: {
  projectId?: string
  organizationId?: string
}) {
  return await prisma.grantEligibility.findFirst({
    where: {
      ...(params.projectId ? { projectId: params.projectId } : {}),
      ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      deletedAt: null,
      submittedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      kycTeam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
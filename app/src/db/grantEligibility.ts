import { prisma } from "./client"

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
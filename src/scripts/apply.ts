import { prisma } from "@/db/client"
import { createApplicationAttestation } from "@/lib/eas"

async function main() {
  const projectId = ""
  // const categoryId = "2"
  const farcasterId = ""
  const metadataSnapshotId = ""

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      organization: {
        where: { deletedAt: null, organization: { deletedAt: null } },
        include: {
          organization: {
            include: {
              team: {
                where: { deletedAt: null },
                include: { user: true },
              },
            },
          },
        },
      },
      repos: true,
      contracts: true,
      links: true,
      funding: true,
      snapshots: {
        orderBy: {
          createdAt: "asc",
        },
      },
      applications: {
        include: {
          category: {
            include: {
              impactStatements: true,
            },
          },
          impactStatementAnswer: true,
          round: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      rewards: { include: { claim: true } },
    },
  })

  const application = project?.applications.find((ap) => ap.roundId === "5")

  // Attest applicaiton
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId,
    round: 5,
    snapshotRef: metadataSnapshotId,
  })

  // Create application in database

  const newApplication = await prisma.application.create({
    data: {
      attestationId,
      projectDescriptionOptions: application!.projectDescriptionOptions,
      project: {
        connect: {
          id: projectId,
        },
      },
      round: {
        connect: {
          id: "5",
        },
      },
      category: {
        connect: {
          id: application!.categoryId!,
        },
      },
      impactStatementAnswer: {
        createMany: {
          data: Object.entries(
            application!.impactStatementAnswer.reduce(
              (acc, { impactStatementId, answer }) => {
                acc[impactStatementId] = answer
                return acc
              },
              {} as Record<string, string>,
            ),
          ).map(([impactStatementId, answer]) => ({
            impactStatementId,
            answer,
          })),
        },
      },
    },
  })

  console.log("Created application", newApplication)
}

main()

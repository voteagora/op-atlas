import { prisma } from "@/db/client"
import { createApplicationAttestation } from "@/lib/eas"
import { uploadToPinata } from "@/lib/pinata"

async function main() {
  const roundId = "6"
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

  const application = project?.applications.find((ap) => ap.roundId === roundId)

  const metadata = {
    round: parseInt(roundId),
    category: application!.category!.name,
    subcategory: application!.projectDescriptionOptions,
    impactStatement: Object.entries(
      application!.impactStatementAnswer.reduce(
        (acc, { impactStatementId, answer }) => {
          acc[impactStatementId] = answer
          return acc
        },
        {} as Record<string, string>,
      ),
    ).map(([impactStatementId, answer]) => {
      const question = application!.category!.impactStatements.find(
        (i) => i.id === impactStatementId,
      )?.question
      return {
        question,
        answer,
      }
    }),
  }

  const ipfsHash = await uploadToPinata(projectId, metadata)

  // Attest applicaiton
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId,
    round: parseInt(roundId),
    snapshotRef: metadataSnapshotId,
    ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
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
          id: roundId,
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

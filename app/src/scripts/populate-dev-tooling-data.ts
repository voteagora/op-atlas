import devToolingDataset from "@/data/dev-tooling.json"
import { prisma } from "@/db/client"

const BATCH_SIZE = 10
async function populate() {
  console.log("📦 Preparing data...")
  const formattedData = await Promise.all(
    devToolingDataset.map(async (data) => {
      // Essential
      const projectId = data.project_name
      const osoId = data.oso_project_id

      // Top Projects
      const topProjectIds = data.onchain_builder_op_atlas_ids
      const topProjects = await prisma.project.findMany({
        where: {
          id: {
            in: topProjectIds,
          },
        },
        select: {
          name: true,
          website: true,
        },
      })

      // Onchain Builders
      const onchainBuildersInAtlasCount = data.developer_connection_count

      // Is Eligible
      const isEligible = data.is_eligible

      return {
        projectId,
        osoId,
        data: {
          topProjects,
          onchainBuildersInAtlasCount,
          isEligible,
        },
      }
    }),
  )
  console.log("✅ Data prepared")

  console.log("🚀 Populating data...")
  const chunks = chunkArray(formattedData, BATCH_SIZE)

  for (const chunk of chunks) {
    await prisma.projectOSOData.createMany({
      data: chunk,
      skipDuplicates: true,
    })
  }
  console.log("✅ Data populated")

  console.log("🧹 Cleaning up...")
  await prisma.$disconnect()
  console.log("✅ Cleaned up")

  console.log("🎉 Done!")
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return array.reduce((acc, _, i) => {
    if (i % size === 0) {
      acc.push(array.slice(i, i + size))
    }
    return acc
  }, [] as T[][])
}

populate()

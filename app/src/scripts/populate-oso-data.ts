import devToolingDataset from "@/data/dev-tooling.json"
import eligibility from "@/data/eligibility.json"
import { prisma } from "@/db/client"

const BATCH_SIZE = 10
async function populate() {
  console.log("📦 Preparing data...")

  const devToolingData = await Promise.all(
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
          thumbnailUrl: true,
        },
      })

      // Onchain Builders
      const onchainBuildersInAtlasCount = data.developer_connection_count

      const result = {
        projectId,
        osoId,
        data: {
          topProjects,
          onchainBuildersInAtlasCount,
        },
      }

      return result
    }),
  )

  const eligibilityData = eligibility.map((data) => {
    // Essential
    const projectId = data.project_name
    const osoId = data.project_id

    // Eligibility Data
    const isEligible = data.is_eligible
    const hasDefillamaAdapter = data.has_defillama_adapter
    const hasBundleBear = data.has_bundle_bear
    const opReward = data.op_reward

    return {
      projectId,
      osoId,
      data: {
        isEligible,
        hasDefillamaAdapter,
        hasBundleBear,
        opReward,
      },
    }
  })

  const mergedData: {
    projectId: string
    osoId: string
    data: {
      isEligible?: boolean
      hasDefillamaAdapter?: boolean
      hasBundleBear?: boolean
      opReward?: number | null
      topProjects?: { name: string; website: string[] }[]
      onchainBuildersInAtlasCount?: number
    }
  }[] = devToolingData

  // Merge data
  eligibilityData.forEach((data) => {
    const index = mergedData.findIndex(
      (entry) => entry.projectId === data.projectId,
    )
    if (index !== -1) {
      mergedData[index].data = {
        ...mergedData[index].data,
        ...data.data,
      }
    } else {
      mergedData.push(data)
    }
  })
  console.log("✅ Data prepared")

  console.log("🚀 Populating data...")
  const chunks = chunkArray(mergedData, BATCH_SIZE)

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

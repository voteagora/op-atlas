import devToolingDataset from "@/data/dev-tooling.json"
import onchainBuilders from "@/data/onchain-builders.json"
import { prisma } from "@/db/client"
import { chunkArray } from "@/lib/utils"

const BATCH_SIZE = 10

async function populate() {
  console.log("🧹 Cleaning up previous data...")
  await prisma.projectOSOData.deleteMany()
  console.log("✅ Cleaned up previous data")

  console.log("📦 Preparing data...")

  const onChainBuildersData = onchainBuilders.map((data) => {
    const projectId = data.project_name
    const osoId = data.project_id

    const isEligible = data.is_eligible
    const hasDefillamaAdapter = data.has_defillama_adapter
    const hasBundleBear = data.has_bundle_bear
    const onchainBuilderReward = data.op_reward

    return {
      projectId,
      osoId,
      data: {
        isEligible,
        hasDefillamaAdapter,
        hasBundleBear,
        onchainBuilderReward,
      },
    }
  })

  const devToolingData = await Promise.all(
    devToolingDataset.map(async (data) => {
      const projectId = data.project_name
      const osoId = data.oso_project_id
      const devToolingReward = data.op_reward

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

      const onchainBuildersInAtlasCount = data.developer_connection_count

      return {
        projectId,
        osoId,
        data: {
          topProjects,
          onchainBuildersInAtlasCount,
          devToolingReward,
        },
      }
    }),
  )

  // Merge data
  const mergedData: {
    data: {
      topProjects?:
        | {
            name: string
            website: string[]
            thumbnailUrl: string | null
          }[]
        | undefined
      onchainBuildersInAtlasCount?: number | undefined
      devToolingReward?: number | undefined
      isEligible?: boolean
      hasDefillamaAdapter?: boolean
      hasBundleBear?: boolean
      onchainBuilderReward?: number | null
    }
    projectId: string
    osoId: string
  }[] = onChainBuildersData.map((onChainData) => {
    const devToolingDataEntry = devToolingData.find(
      (entry) => entry.projectId === onChainData.projectId,
    )

    return {
      ...onChainData,
      data: {
        ...onChainData.data,
        ...(devToolingDataEntry?.data ?? {}),
      },
    }
  })
  // Add devToolingData that doesn't exist in onChainBuildersData
  const devToolingDataWithoutOnChainBuilders = devToolingData.filter(
    (devToolingDataEntry) =>
      !mergedData.some(
        (onChainData) =>
          onChainData.projectId === devToolingDataEntry.projectId,
      ),
  )
  mergedData.push(...devToolingDataWithoutOnChainBuilders)

  console.log("✅ Data prepared")

  console.log("🚀 Populating data...")
  const chunks = chunkArray(mergedData, BATCH_SIZE)
  for (const chunk of chunks) {
    await prisma.projectOSOData.createMany({
      data: chunk.map((entry) => ({
        projectId: entry.projectId,
        osoId: entry.osoId,
        data: entry.data,
      })),
      skipDuplicates: true,
    })
  }
  console.log("✅ Data populated")
}

populate()

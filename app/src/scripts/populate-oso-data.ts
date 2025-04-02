import fs from "fs/promises"
import path from "path"

import { prisma } from "@/db/client"
import { chunkArray } from "@/lib/utils"

const BATCH_SIZE = 10

type OnchainBuildersItem = {
  project_name: string
  project_id: string
  is_eligible: boolean
  has_defillama_adapter: boolean
  has_bundle_bear: boolean
  op_reward: number | null
}

type DevToolingItem = {
  project_name: string
  project_id: string
  is_eligible: boolean
  op_reward: number
  onchain_builder_op_atlas_ids: string[]
  developer_connection_count: number
}

async function readJsonFile<T>(filePath: string): Promise<T[] | null> {
  try {
    const file = await fs.readFile(filePath, "utf-8")
    return JSON.parse(file) as T[]
  } catch (err) {
    console.warn(`⚠️ ${filePath} not found or unreadable, skipping...`)
    return null
  }
}

async function populate() {
  console.log("🧹 Cleaning up previous data...")
  await prisma.projectOSOData.deleteMany()
  console.log("✅ Cleaned up previous data")

  console.log("📦 Preparing data...")

  const devToolingPath = path.join(process.cwd(), "data", "dev-tooling.json")
  const onchainBuildersPath = path.join(
    process.cwd(),
    "data",
    "onchain-builders.json",
  )

  const devToolingDataset = await readJsonFile<DevToolingItem>(devToolingPath)
  const onchainBuilders = await readJsonFile<OnchainBuildersItem>(
    onchainBuildersPath,
  )

  const onChainBuildersData = (onchainBuilders ?? []).map((data) => {
    const projectId = data.project_name
    const osoId = data.project_id

    return {
      projectId,
      osoId,
      data: {
        onchainBuilderEligible: data.is_eligible,
        hasDefillamaAdapter: data.has_defillama_adapter,
        hasBundleBear: data.has_bundle_bear,
        onchainBuilderReward: data.op_reward,
      },
    }
  })

  const devToolingData = devToolingDataset
    ? await Promise.all(
        devToolingDataset.map(async (data) => {
          const projectId = data.project_name
          const osoId = data.project_id

          const topProjects = await prisma.project.findMany({
            where: {
              id: {
                in: data.onchain_builder_op_atlas_ids,
              },
            },
            select: {
              id: true,
              name: true,
              website: true,
              thumbnailUrl: true,
            },
          })

          return {
            projectId,
            osoId,
            data: {
              devToolingEligible: data.is_eligible,
              topProjects,
              onchainBuildersInAtlasCount: data.developer_connection_count,
              devToolingReward: data.op_reward,
            },
          }
        }),
      )
    : []

  // Merge data
  const mergedData = onChainBuildersData.map((onChainData) => {
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

  const devToolingDataWithoutOnChainBuilders = devToolingData.filter(
    (entry) => !mergedData.some((m) => m.projectId === entry.projectId),
  )

  mergedData.push(
    ...devToolingDataWithoutOnChainBuilders.map((entry) => ({
      ...entry,
      data: {
        ...entry.data,
        onchainBuilderEligible: false,
        hasDefillamaAdapter: false,
        hasBundleBear: false,
        onchainBuilderReward: null,
      },
    })),
  )

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

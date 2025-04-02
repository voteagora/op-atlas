import fs from "fs/promises"
import path from "path"
import { v4 as uuidV4 } from "uuid"

import { prisma } from "@/db/client"
import { chunkArray } from "@/lib/utils"

const BATCH_SIZE = 10

type OnchainBuilderItem = {
  project_name: string
  op_reward?: number
  round_id: string
}

const onchainBuildersPath = path.join(
  process.cwd(),
  "data",
  "onchain-builders.json",
)

const populateRecipientsRewards = async () => {
  console.log("📦 Preparing data")

  let onchainBuilders: OnchainBuilderItem[] = []
  try {
    const file = await fs.readFile(onchainBuildersPath, "utf-8")
    onchainBuilders = JSON.parse(file)
  } catch (err) {
    console.warn("⚠️ onchain-builders.json not found, skipping population")
    return
  }

  const rewards = onchainBuilders
    .map((item) => ({
      id: uuidV4(),
      projectId: item.project_name,
      amount: item.op_reward ?? 0,
      roundId: item.round_id,
    }))
    .filter((item) => item.amount > 0)

  console.log("🚀 Inserting data")
  const batches = chunkArray(rewards, BATCH_SIZE)
  for (const batch of batches) {
    await prisma.fundingReward.createMany({
      data: batch,
      skipDuplicates: true,
    })
  }

  console.log("✅ Done")
}

populateRecipientsRewards()

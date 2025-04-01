import fs from "fs/promises"
import path from "path"
import { v4 as uuidV4 } from "uuid"

import { prisma } from "@/db/client"
import { chunkArray } from "@/lib/utils"

const BATCH_SIZE = 10

type DevToolingItem = {
  project_name: string
  op_reward?: number
  round_id: string
}

const devToolingPath = path.join(process.cwd(), "data", "dev-tooling.json")

const populateRecipientsRewards = async () => {
  console.log("📦 Preparing data")

  let devTooling: DevToolingItem[] = []

  try {
    const file = await fs.readFile(devToolingPath, "utf-8")
    devTooling = JSON.parse(file)
  } catch (err) {
    console.warn("⚠️ dev-tooling.json not found, skipping population")
    return
  }

  const rewards = devTooling
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

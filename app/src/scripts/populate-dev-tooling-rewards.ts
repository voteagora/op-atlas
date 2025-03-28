import { v4 as uuidV4 } from "uuid"

import devTooling from "@/data/dev-tooling.json"
import { prisma } from "@/db/client"
import { chunkArray } from "@/lib/utils"

const BATCH_SIZE = 10

const populateRecipientsRewards = async () => {
  console.log("📦 Preparing data")
  const rewards = devTooling
    .map((item) => {
      return {
        id: uuidV4(),
        projectId: item.project_name,
        amount: item.op_reward ?? 0,
        roundId: item.round_id,
      }
    })
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

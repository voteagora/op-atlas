import { readFile } from "fs/promises"
import { splitEvery } from "ramda"

import { insertRewards } from "@/db/rewards"
import { nanoid } from "@/lib/utils"

const CSV_PATH = "rewards.csv"

/**
 * Expecting a format of:
 * projectId,amount
 *
 * We generate the reward IDs on our end
 */

async function ingestRewards() {
  const file = await readFile(CSV_PATH)
  const entries = file.toString().split("\n")

  const rewards: { id: string; projectId: string; amount: number }[] = []
  for (const row of entries) {
    const fields = row.split(",")
    if (fields.length !== 4) {
      if (row.trim() !== "") {
        console.error("Invalid reward row:", row)
      }

      continue
    }

    const [projectId, grantId, name, amount] = fields

    rewards.push({
      id: grantId,
      projectId,
      amount: parseFloat(amount),
    })
  }

  for (const batch of splitEvery(50, rewards)) {
    await insertRewards(batch)
  }

  console.log(
    `Inserted ${rewards.length} reward${rewards.length === 1 ? "" : "s"}`,
  )
}

console.log("Ingesting rewards...")

ingestRewards()
  .then(() => {
    console.log("Done")
  })
  .catch((error) => {
    console.error("Error ingesting rewards:", error)
  })

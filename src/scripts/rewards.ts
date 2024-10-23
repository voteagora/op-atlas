import { readFile, writeFile } from "fs/promises"
import { splitEvery } from "ramda"

import { prisma } from "@/db/client"

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

  let grantId = 208

  const rewards: {
    id: string
    projectId: string
    amount: number
    applicationId: string
    name: string
  }[] = []
  for (const row of entries) {
    const fields = row.split(",")
    if (fields.length !== 3) {
      if (row.trim() !== "") {
        console.error("Invalid reward row:", row)
      }

      continue
    }

    const [applicationId, name, amount] = fields

    console.log({
      applicationId,
      name,
      amount,
    })

    const project = await prisma.application.findFirst({
      where: {
        attestationId: applicationId,
      },
    })

    if (!project) {
      throw new Error(`Project not found: ${applicationId}`)
    }

    rewards.push({
      id: grantId.toString(),
      projectId: project.projectId,
      amount: parseFloat(amount),
      applicationId,
      name,
    })

    grantId++
  }

  for (const batch of splitEvery(50, rewards)) {
    console.log("Inserting rewards...")
    console.log(batch)

    await prisma.fundingReward.createMany({
      data: batch.map((reward) => ({
        roundId: "5",
        id: reward.id,
        projectId: reward.projectId,
        amount: reward.amount,
      })),
      skipDuplicates: true,
    })
  }

  console.log(
    `Inserted ${rewards.length} reward${rewards.length === 1 ? "" : "s"}`,
  )

  // write the rewards to csv file (projectId, rewardId)
  const csv = rewards
    .map(
      ({ id, projectId, applicationId, name, amount }) =>
        `${id},${projectId},${applicationId},${name},${amount}`,
    )
    .join("\n")

  await writeFile("rewards-output.csv", csv)
}

console.log("Ingesting rewards...")

ingestRewards()
  .then(() => {
    console.log("Done")
  })
  .catch((error) => {
    console.error("Error ingesting rewards:", error)
  })

import { prisma } from "@/db/client"

async function cleanupFundingRewards() {
  console.log("🧹 Cleaning up funding rewards...")
  const deleted = await prisma.fundingReward.deleteMany({
    where: {
      amount: 0,
    },
  })
  console.log("✅ Funding rewards cleaned up. Count: ", deleted.count)
}

cleanupFundingRewards()

import { redirect } from "next/navigation"

import { auth } from "@/auth"
import RewardClaimFlow from "@/components/rewards/RewardClaimFlow"
import { getReward } from "@/db/rewards"
import { verifyAdminStatus } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { rewardId: string }
}) {
  const session = await auth()
  const claim = await getReward({ id: params.rewardId })

  if (!claim || !session) {
    redirect("/dashboard")
  }

  const isInvalid = await verifyAdminStatus(
    claim.projectId,
    session.user.farcasterId,
  )

  if (isInvalid?.error) {
    redirect("/dashboard")
  }

  const isUserAdmin = !isInvalid?.error

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <RewardClaimFlow
        className="mt-18 max-w-4xl"
        reward={claim}
        isUserAdmin={isUserAdmin}
      />
    </main>
  )
}

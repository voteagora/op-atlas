import { redirect } from "next/navigation"

import { getReward } from "@/app/api/db/rewards"
import { auth } from "@/auth"
import RewardClaimFlow from "@/components/rewards/RewardClaimFlow"

export default async function Page({
  params,
}: {
  params: { rewardId: string }
}) {
  const session = await auth()
  const claim = await getReward({ id: params.rewardId })

  if (
    !claim ||
    !claim.project.team.some(({ userId }) => userId === session?.user.id)
  ) {
    redirect("/dashboard")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <RewardClaimFlow className="mt-18 max-w-4xl" reward={claim} />
    </main>
  )
}

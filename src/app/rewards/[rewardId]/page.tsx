import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getReward } from "@/db/rewards"

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

  return <div />
}

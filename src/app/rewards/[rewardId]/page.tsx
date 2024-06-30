import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ExternalLink from "@/components/ExternalLink"
import RewardClaimFlow from "@/components/rewards/RewardClaimFlow"
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

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <RewardClaimFlow className="mt-18 max-w-4xl" reward={claim} />
      <div className="mt-18">
        <p className="text-center text-secondary-foreground text-sm">
          Need help?{" "}
          <ExternalLink
            href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
            className="font-medium"
          >
            View frequently asked questions
          </ExternalLink>{" "}
          or{" "}
          <ExternalLink
            href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
            className="font-medium"
          >
            contact support
          </ExternalLink>
        </p>
      </div>
    </main>
  )
}

"use client"

import { useSession } from "next-auth/react"

import { useSessionAdminProjects } from "@/hooks/db/useAdminProjects"
import { MISSIONS_AND_ROUNDS } from "@/lib/MissionsAndRoundData"
import { UserWithAddresses } from "@/lib/types"

import { FeedbackButton } from "../common/FeedbackButton"
import { FundingRounds } from "./FundingRounds"
import { Sidebar } from "./Sidebar"

export function Rounds({ user }: { user?: UserWithAddresses | null }) {
  const { data } = useSession()

  const { data: userProjects } = useSessionAdminProjects()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* {!data && (
        <div className="z-10 w-full py-3 text-center text-background text-sm font-medium bg-accent-foreground">
          The results are in! Sign in to see your Retro Funding 6 rewards.
        </div>
      )} */}
      {/* Main content */}
      <div className="mt-4 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-semibold">Retro Funding Missions</h1>
        </div>

        <div className="mt-10 flex flex-1 gap-x-10">
          <div className="flex flex-col flex-1 gap-y-12">
            <FundingRounds fundingRounds={MISSIONS_AND_ROUNDS} />
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-text-default">
                About Retro Funding
              </h2>
              <p className="mt-6 text-base font-normal text-text-secondary">
                Retroactive Public Goods Funding (Retro Funding) offers a
                sustainable model for individuals to receive rewards for their
                contributions to Optimism&apos;s success, ensuring that efforts
                are not only recognized but also effectively rewarded.
              </p>
              <p className="mt-6 text-base font-normal text-text-secondary">
                Retroactive Funding is based on the idea that it&apos;s easier
                to agree on what was useful in the past than what might be
                useful in the future. This is a series of experiments where
                members of the Citizens&apos; House allocate rewards to projects
                they deem have provided positive impact to the Optimism
                Collective.
              </p>
              <p className="mt-6 text-base font-normal text-text-secondary">
                This is core to Optimism&apos;s value of impact = profit: the
                idea that that positive impact to the collective should be
                rewarded proportionally with profit to the individual.
              </p>
            </div>
          </div>
          <Sidebar
            className="ml-auto w-[260px] pt-12"
            user={user}
            userProjects={userProjects}
          />
        </div>
      </div>
      {data?.user && (
        <div className="fixed bottom-4 left-4 z-50">
          <FeedbackButton />
        </div>
      )}
    </main>
  )
}

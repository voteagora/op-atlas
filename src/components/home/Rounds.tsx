"use client"

import { useSession } from "next-auth/react"

import { FUNDING_ROUNDS } from "@/lib/mocks"

import { Account } from "../common/Account"
import { FeedbackButton } from "../common/FeedbackButton"
import ExternalLink from "../ExternalLink"
import { FundingRounds } from "./FundingRounds"
import { Sidebar } from "./Sidebar"

export function Rounds() {
  const { data } = useSession()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {!data && (
        <div className="z-10 w-full py-3 text-center text-background text-sm font-medium bg-accent-foreground">
          The results are in! Sign in to see your Retro Funding Round 4 results.
        </div>
      )}
      {/* Background image */}
      <div
        className="absolute h-[500px] w-full"
        style={{
          backgroundImage: 'url("/assets/images/gradient-background.svg")',
          backgroundSize: "cover",
        }}
      />

      {/* Main content */}
      <div className="mt-36 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-semibold">Rounds</h1>
          <p className="mt-2 text-muted-foreground">
            Build together, benefit together.
          </p>
          {!data?.user && (
            <div className="hidden sm:flex items-center mt-6">
              <Account />
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-1 gap-x-6">
          <div className="flex flex-col flex-1 gap-y-12">
            <FundingRounds fundingRounds={FUNDING_ROUNDS} />
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">About Retro Funding</h2>
              <p className="mt-6 text-muted-foreground">
                Retroactive Public Goods Funding (Retro Funding) offers a
                sustainable model for individuals to receive rewards for their
                contributions to Optimism&apos;s success, ensuring that efforts
                are not only recognized but also effectively rewarded.
              </p>
              <p className="mt-6 text-muted-foreground">
                Retroactive Funding is based on the idea that it&apos;s easier
                to agree on what was useful in the past than what might be
                useful in the future. This is a series of experiments where
                members of the Citizens&apos; House allocate rewards to projects
                they deem have provided positive impact to the Optimism
                Collective.
              </p>
              <p className="mt-6 text-muted-foreground">
                This is core to Optimism&apos;s value of impact = profit: the
                idea that that positive impact to the collective should be
                rewarded proportionally with profit to the individual.
              </p>

              <p className="mt-6 text-muted-foreground">
                Want to go deeper?{" "}
                <ExternalLink
                  href="https://app.optimism.io/retropgf"
                  className="font-semibold no-underline"
                >
                  Learn more
                </ExternalLink>
              </p>
            </div>
          </div>
          <Sidebar className="ml-auto w-[260px] pt-12" />
        </div>
      </div>
      {data?.user && (
        <div className="fixed bottom-4 left-4">
          <FeedbackButton />
        </div>
      )}
    </main>
  )
}

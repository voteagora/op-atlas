import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { FundingRounds } from "@/components/home/FundingRounds"
import { Sidebar } from "@/components/home/Sidebar"
import { FUNDING_ROUNDS } from "@/lib/mocks"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12">
      {/* Gradient backdrop */}
      <div className="absolute inset-x-0 top-18 h-[500px] bg-rainbow" />
      <div className="absolute inset-x-0 top-18 h-[500px] bg-gradient-to-b from-background/0 to-background/100" />

      {/* Main content */}
      <div className="mt-36 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-semibold">Retro Funding Rounds</h1>
          <p className="mt-2 text-muted-foreground">
            Build together, benefit together.
          </p>
        </div>

        <div className="mt-10 flex flex-1 gap-x-6">
          <div className="flex flex-col flex-1 gap-y-12">
            <FundingRounds fundingRounds={FUNDING_ROUNDS} />
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">About Retro Funding</h2>
              <p className="mt-6 text-muted-foreground">
                Retroactive Public Goods Funding (RetroPGF) is based on the idea
                that it&apos;s easier to agree on what was useful in the past
                than what might be useful in the future. This is a series of
                experiments where members of the Citizens&apos; House allocate
                protocol revenue or portions of the RetroPGF token allocation to
                projects they deem have provided positive impact to the Optimism
                Collective.
              </p>
              <p className="mt-6 text-muted-foreground">
                This is core to Optimism&apos;s value of impact = profit: the
                idea that that positive impact to the collective should be
                rewarded proportionally with profit to the individual.
              </p>
              <p className="mt-6 text-muted-foreground">
                Want to go deeper?{" "}
                <Link href="#" className="font-semibold no-underline">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <Sidebar className="ml-auto w-[260px] pt-12" />
        </div>
      </div>
    </main>
  )
}

import { Scale } from "lucide-react"

import Proposals from "@/components/proposals/proposalsPage/components/Proposals"
import { getEnrichedProposalData } from "@/lib/proposals"

interface ProposalsPageProps {
  userId?: string
}

const ProposalsPage = async ({ userId }: ProposalsPageProps) => {
  // Get the proposals
  const proposalData = await getEnrichedProposalData({
    userId: userId,
  })
  const { standardProposals, selfNominations } = proposalData

  if (
    !proposalData ||
    (proposalData.standardProposals.length === 0 &&
      proposalData.selfNominations.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Scale className="w-48 h-48 text-muted" />
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            There are currently no governance proposals available.
          </h3>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-40 gap-[46px] mt-10 max-w-[1064px] md:mx-auto mx-2">
      <h1 className="w-full h-[44px] text-[36px] font-semibold leading-[0px] tracking-[0%]">
        Governance
      </h1>
      <div className="flex flex-col gap-12 w-full max-w-[66.5rem] ml-10 mr-10">
        {selfNominations.length > 0 && (
          <Proposals
            proposals={selfNominations}
            heading="Self Nominate for a governance role in Season 8 & 9"
            subheading="Calling all canidates! Submit your nominations from [date] - [date]"
          />
        )}
        <Proposals proposals={standardProposals} heading="Proposals" />
      </div>
    </main>
  )
}

export default ProposalsPage

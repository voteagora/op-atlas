import { Scale } from "lucide-react"

import { getEnrichedProposalData } from "@/lib/proposals"
import Proposals from "./components/Proposals"

interface ProposalsPageProps {
  userId?: string
}

const ProposalsPage = async ({ userId }: ProposalsPageProps) => {
  // Get the proposals
  const proposalData = await getEnrichedProposalData({
    userId: userId,
  })
  const { standardProposals } = proposalData

  if (
    !proposalData ||
    (proposalData.standardProposals.length === 0 &&
      proposalData.selfNominations.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
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
    <div className="flex flex-col gap-12">
      <Proposals proposals={standardProposals} heading="Proposals" />
    </div>
  )
}

export default ProposalsPage

import { Role } from "@prisma/client"
import { Scale } from "lucide-react"

import { getEnrichedProposalData } from "@/lib/proposals"

import PaginatedProposals from "./components/PaginatedProposals"

interface ProposalsPageProps {
  userId?: string
  securityRoles?: Role[]
}

const ProposalsPage = async ({
  userId,
  securityRoles = [],
}: ProposalsPageProps) => {
  // Get the proposals
  const proposalData = await getEnrichedProposalData({
    userId: userId,
  })
  const { standardProposals } = proposalData

  if (
    !proposalData ||
    (proposalData.standardProposals.proposals.length === 0 &&
      proposalData.selfNominations.length === 0 &&
      securityRoles.length === 0)
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
      <PaginatedProposals
        initialProposals={standardProposals.proposals}
        initialPagination={{
          has_next: standardProposals.pagination?.has_next ?? false,
          total_returned: standardProposals.pagination?.total_returned ?? 0,
          next_offset: standardProposals.pagination?.next_offset ?? 0,
        }}
        userId={userId}
        securityRoles={securityRoles}
      />
    </div>
  )
}

export default ProposalsPage

import { notFound } from "next/navigation"

import ProposalPage from "@/components/proposals/proposalPage/ProposalPage"
import { getProposal } from "@/lib/proposals"

interface PageProps {
  params: {
    proposalId: string
  }
}

const Page = async (params: PageProps) => {
  const proposalId = params.params.proposalId
  const proposalData = await getProposal(proposalId)

  if (!proposalData) {
    return notFound()
  }

  return <ProposalPage proposalData={proposalData} />
}

export default Page

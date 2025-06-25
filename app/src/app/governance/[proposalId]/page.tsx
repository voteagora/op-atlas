import { notFound } from "next/navigation"

import ProposalPage from "@/components/proposals/proposalPage/ProposalPage"

interface PageProps {
  params: {
    proposalId: string
  }
}

const Page = async (params: PageProps) => {
  const proposalId = params.params.proposalId
  if (!proposalId) {
    console.error("Missing Proposal ID")
    return notFound()
  }

  return <ProposalPage proposalId={proposalId} />
}

export default Page

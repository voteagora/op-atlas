import { Metadata } from "next"
import { notFound } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import ProposalPage from "@/components/proposals/proposalPage/ProposalPage"
import { getProposal } from "@/lib/proposals"

interface PageProps {
  params: {
    proposalId: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: {
    proposalId: string
  }
}): Promise<Metadata> {
  const proposal = await getProposal(params.proposalId)
  const title = `Proposals: ${proposal?.markdowntitle ?? ""} - OP Atlas`
  const description = proposal?.description ?? ""
  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
    },
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

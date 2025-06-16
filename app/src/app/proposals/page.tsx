import { UIProposal } from "@/app/api/v1/proposals/route"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"
import Proposals from "@/app/proposals/proposalsPage/components/Proposals"
import { auth } from "@/auth"
import { getCitizenProposalVote, getUserCitizen } from "@/db/citizens"
import { getProposals } from "@/lib/proposals"

interface OffchainVote {
  attestationId: string
  voterAddress: string
  proposalId: string
  vote: { vote: string[] }
  transactionHash?: string
  citizenId: number
  citizenCategory: string
  createdAt: Date
  updatedAt: Date
}

const enrichProposalData = async (
  proposals: { standardProposals: UIProposal[]; selfNominations: UIProposal[] },
  citizenId: number,
) => {
  // Helper function to enrich a single proposal with vote information
  const enrichSingleProposal = async (
    proposal: UIProposal,
  ): Promise<UIProposal> => {
    const offchainVote: OffchainVote = await getCitizenProposalVote(
      citizenId,
      proposal.id,
    )

    // Check if we have a valid citizen with vote data
    const hasVoted =
      offchainVote?.vote?.vote &&
      Array.isArray(offchainVote.vote.vote) &&
      offchainVote.vote.vote.length > 0

    const isVotedProposal = hasVoted && offchainVote.proposalId === proposal.id

    return {
      ...proposal,
      voted: isVotedProposal ? true : proposal.voted,
    }
  }

  // Process both types of proposals using the helper function
  const enrichedStandardProposals = await Promise.all(
    proposals.standardProposals.map(enrichSingleProposal),
  )

  const enrichedSelfNominations = await Promise.all(
    proposals.selfNominations.map(enrichSingleProposal),
  )

  return {
    standardProposals: enrichedStandardProposals,
    selfNominations: enrichedSelfNominations,
  }
}

const getEnrichedProposalData = async ({ userId }: { userId?: string }) => {
  try {
    // Get the proposal data from the API
    const proposalData = await getProposals()
    try {
      if (!userId) {
        return proposalData
      }

      // Get the citizen data from DB
      const citizen = await getUserCitizen(userId)
      if (!citizen) {
        return proposalData
      }

      // Enrich the proposal data with citizen data for conditional vote status rendering
      return enrichProposalData(proposalData, citizen.id)
    } catch (error) {
      console.error(`Failed to fetch Citizen Data: ${error}`)
      // If we can't get citizen data, just return the proposal data as is
      return proposalData
    }
  } catch (error) {
    console.error(`Failed to fetch Proposal Data: ${error}`)
    // If we can't get proposal data, return empty arrays
    return { standardProposals: [], selfNominations: [] }
  }
}

const Page = async () => {
  // Get the proposals page

  const session = await auth()

  const proposalData = await getEnrichedProposalData({
    userId: session?.user.id,
  })
  const { standardProposals, selfNominations } = proposalData

  if (
    !proposalData ||
    (proposalData.standardProposals.length === 0 &&
      proposalData.selfNominations.length === 0)
  ) {
    return (
      <div className="items-center justify-center align-middle">
        No Governance Proposals Found
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

export default Page

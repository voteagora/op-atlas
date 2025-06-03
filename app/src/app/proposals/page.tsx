import { UIProposal } from "@/app/api/v1/proposals/route"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"
import Proposals from "@/app/proposals/proposalsPage/components/Proposals"
import { getCitizenVotes, getUserCitizen } from "@/db/citizens"
import { auth } from "@/auth"

const getProposalData = async () => {
  const proposalResponse = await fetch(
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `http://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/proposals`
      : `/api/proposals`,
  )

  return proposalResponse.json()
}

const getCitizenVoteData = async (userId: string) => {
  const citizen = await getUserCitizen(userId)
  if (!citizen) {
    return []
  }
  try {
    return await getCitizenVotes(citizen.id)
  } catch (error) {
    console.error("Failed to fetch Citizen Votes")
    return []
  }
}

const enrichProposalData = (
  proposals: { standardProposals: UIProposal[]; selfNominations: UIProposal[] },
  citizen: any,
) => {
  // Create a map of proposal IDs to their vote status for quick lookup
  const proposalVoteMap = new Map()

  // Check if citizen has votes
  if (citizen && citizen.votes && Array.isArray(citizen.votes)) {
    // Process each vote from the single citizen
    citizen.votes.forEach(
      (vote: { proposalId: string; voteStatus: string }) => {
        proposalVoteMap.set(vote.proposalId, vote.voteStatus)
      },
    )
  }

  // Update standard proposals with vote information
  const enrichedStandardProposals = proposals.standardProposals.map(
    (proposal: UIProposal) => {
      const voteStatus = proposalVoteMap.get(proposal.id)
      return {
        ...proposal,
        // If we have a vote for this proposal, mark it as voted
        voted: voteStatus ? true : proposal.voted,
      }
    },
  )

  // Update self nominations with vote information
  const enrichedSelfNominations = proposals.selfNominations.map(
    (proposal: UIProposal) => {
      const voteStatus = proposalVoteMap.get(proposal.id)
      return {
        ...proposal,
        // If we have a vote for this proposal, mark it as voted
        voted: voteStatus ? true : proposal.voted,
      }
    },
  )

  return {
    standardProposals: enrichedStandardProposals,
    selfNominations: enrichedSelfNominations,
  }
}

const getEnrichedProposalData = async ({ userId }: { userId?: string }) => {
  try {
    // Get the proposal data from the API
    const proposalData = await getProposalData()
    try {
      if (!userId) {
        return proposalData
      }
      // Get the citizen data from DB
      const CitizenVoteData = await getCitizenVoteData(userId)
      // Enrich the proposal data with citizen data for conditional vote status rendering
      return enrichProposalData(proposalData, CitizenVoteData)
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

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-40 gap-[46px] mt-10 max-w-[1064px] mx-auto">
      <div className="flex flex-col gap-12">
        <h1 className="w-full h-[44px] text-[36px] font-semibold leading-[0px] tracking-[0%]">
          Governance
        </h1>
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

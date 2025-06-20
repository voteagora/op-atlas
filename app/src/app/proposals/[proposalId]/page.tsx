import { notFound } from "next/navigation"
import Breadcrumbs from "@/components/proposals/Breadcrumbs"
import ProposalContent from "@/components/proposals/proposalContent/ProposalContent"
import VotingSidebar from "@/components/proposals/VotingSidebar/VotingSidebar"
import ProposalHeader from "@/components/proposals/ProposalHeader"

import { getVotingProps } from "@/app/proposals/utils/votingUtils"

import { getProposal } from "@/lib/proposals"
import { auth } from "@/auth"
import { getUserById } from "@/db/users"
import { getCitizenByType, getCitizenProposalVote } from "@/db/citizens"
import {
  ProposalPageDataInterface,
  ProposalType,
} from "@/app/proposals/proposal.types"
import { parseEnumValue } from "@/lib/actions/utils"
import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { CitizenLookup } from "@/lib/types"
import { CITIZEN_TYPES } from "@/lib/constants"
import { Citizen } from "@prisma/client"

interface PageProps {
  params: {
    proposalId: string
  }
}

const CURRENT_DATETIME = new Date()

const Page = async (params: PageProps) => {
  // Get the proposals page

  const proposalId = params.params.proposalId
  if (!proposalId) {
    console.error("Missing Proposal ID")
    return notFound()
  }

  let proposalData: any
  try {
    proposalData = await getProposal(proposalId)
  } catch (error) {
    console.error(`Failed to fetch Proposal Data: ${error}`)
    return notFound()
  }

  const session = await auth()
  const userId = session?.user.id ?? ""
  let user: any
  try {
    user = await getUserById(userId)
  } catch (error) {
    console.error(`Failed to fetch User Data: ${error}`)
  }

  let citizen: any = null
  // Priority in which a citizen should be searched for
  const CITIZEN_PRIORITY: CitizenLookup["type"][] = [
    CITIZEN_TYPES.user,
    CITIZEN_TYPES.app,
    CITIZEN_TYPES.chain,
  ]

  /**
   * Returns the first citizen found according to the provided priority list.
   */
  async function findCitizenByPriority(
    id: string,
    priorities: CitizenLookup["type"][] = CITIZEN_PRIORITY,
  ): Promise<Citizen | null> {
    // Loops through citizen types in the priority list and returns the first citizen found
    for (const type of priorities) {
      const found = await getCitizenByType({ type, id })
      if (found) return found
    }
    return null
  }

  if (user) {
    citizen = (await findCitizenByPriority(userId)) ?? citizen
  }
  const citizenEligibility = await s8CitizenshipQualification()

  // Date Info
  const proposalStartDate = new Date(proposalData.startTime)
  const proposalEndDate = new Date(proposalData.endTime)
  const votingOpen =
    proposalStartDate < CURRENT_DATETIME && proposalEndDate > CURRENT_DATETIME
  const votingComplete = CURRENT_DATETIME > proposalEndDate

  // Breadcrumbs
  const breadcrumbs = ["Proposals", proposalData.proposalType]

  // Voting Info
  let voteHistory
  if (citizen && citizen.id) {
    voteHistory = await getCitizenProposalVote(citizen.id, proposalId)
  }
  const voted = !!voteHistory

  const proposalPageData: ProposalPageDataInterface = {
    user: user,
    citizen: citizen,
    votingOpen: votingOpen,
    votingComplete: votingComplete,
    voted: voted,
    votingRecord: voteHistory,
    startDate: proposalStartDate,
    endDate: proposalEndDate,
    proposalType: parseEnumValue<ProposalType>(
      ProposalType,
      proposalData.proposalType,
    ),
    proposalId: proposalId,
    proposalStatus: proposalData.status,
    citizenEligibility: citizenEligibility,
  }

  const { votingCardProps, votingColumnProps, votingRedirectProps } =
    getVotingProps(proposalPageData)

  return (
    <main className="flex w-full h-full pb-[160px] gap-[80px] mx-auto items-center">
      <div className="flex flex-col w-2/3 mt-24 h-[865px] gap-[48px] mx-auto">
        <div className="flex flex-col gap-[44px]">
          <div className="flex justify-between items-start flex-col md:flex-row">
            <div className="w-full flex flex-col gap-[44px] mb-8 md:mb-0">
              <Breadcrumbs values={breadcrumbs} />
              <ProposalHeader
                title={proposalData.markdowntitle}
                status={proposalData.status}
              />
              <ProposalContent description={proposalData.description} />
            </div>
            <div className="w-full md:w-[304px] md:ml-12">
              <VotingSidebar
                className="sticky top-4"
                votingCardProps={votingCardProps!}
                votingColumnProps={votingColumnProps}
                votingRedirectProps={votingRedirectProps!}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page

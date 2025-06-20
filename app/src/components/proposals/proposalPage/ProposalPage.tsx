import { Citizen } from "@prisma/client"
import { notFound } from "next/navigation"

import {
  ProposalPageDataInterface,
  ProposalType,
} from "@/components/proposals/proposal.types"
import { getVotingProps } from "@/app/proposals/utils/votingUtils"
import { auth } from "@/auth"
import Breadcrumbs from "@/components/proposals/proposalPage/proposalContent/Breadcrumbs"
import Markdown from "@/components/proposals/proposalPage/proposalContent/Markdown"
import ProposalHeader from "@/components/proposals/proposalPage/proposalContent/ProposalHeader"
import VotingSidebar from "@/components/proposals/proposalPage/VotingSidebar/VotingSidebar"
import { getCitizenByType, getCitizenProposalVote } from "@/db/citizens"
import { getUserById } from "@/db/users"
import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { parseEnumValue } from "@/lib/actions/utils"
import { CITIZEN_TYPES } from "@/lib/constants"
import { getProposal } from "@/lib/proposals"
import { CitizenLookup } from "@/lib/types"

interface ProposalPageProps {
  proposalId: string
}

const CURRENT_DATETIME = new Date()

function stripTitleFromDescription(title: string, description: string) {
  if (description.startsWith(`# ${title}`)) {
    return description.slice(`# ${title}`.length).trim()
  }
  // If title not found return the description as is
  return description
}

const ProposalPage = async ({ proposalId }: ProposalPageProps) => {
  let proposalData: any
  try {
    proposalData = await getProposal(proposalId)
  } catch (error) {
    console.error(`Failed to fetch Proposal Data: ${error}`)
    return notFound()
  }

  const deTitledProposalDescription = stripTitleFromDescription(
    proposalData.markdowntitle,
    proposalData.description,
  )

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
      <div className="proposal flex flex-col max-w[1064px] mt-24 h-[865px] gap-[48px] mx-auto">
        <div className="flex flex-col gap-[44px]">
          <div className="column-container gap-[48px] flex justify-between items-start flex-col md:flex-row">
            <div className="proposal-content w-full lg:min-w-[712px] max-w-[712px] flex flex-col gap-[44px] mb-8 md:mb-0">
              <Breadcrumbs values={breadcrumbs} />
              <ProposalHeader
                title={proposalData.markdowntitle}
                status={proposalData.status}
              />
              <Markdown description={deTitledProposalDescription} />
            </div>
            <div className="voting-sidebar w-full md:w-[304px]">
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

export default ProposalPage

import { Citizen } from "@prisma/client"
import { notFound } from "next/navigation"

import { getVotingProps } from "@/app/proposals/utils/votingUtils"
import { auth } from "@/auth"
import {
  ProposalPageDataInterface,
  ProposalType,
} from "@/components/proposals/proposal.types"
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

  // Format dates for display (MM-DD-YYYY) - same format as ProposalCard
  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  }

  const formattedStartDate = formatDate(proposalStartDate)
  const formattedEndDate = formatDate(proposalEndDate)

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
    <main className="flex w-full min-h-screen pb-[160px] mx-auto">
      <div className="proposal flex flex-col w-full max-w-[1064px] mt-16 md:mt-24 gap-8 md:gap-[48px] mx-auto px-4 md:px-6">
        <div className="column-container gap-6 md:gap-[48px] flex justify-between items-start flex-col md:flex-row">
          <div className="proposal-content w-full lg:min-w-[712px] lg:max-w-[712px] flex flex-col gap-6 md:gap-[44px] mb-8 md:mb-0 min-w-0">
            <Breadcrumbs values={breadcrumbs} />
            <ProposalHeader
              title={proposalData.markdowntitle}
              status={proposalData.status}
              startDate={formattedStartDate}
              endDate={formattedEndDate}
            />
            <Markdown description={deTitledProposalDescription} />
          </div>
          <div className="voting-sidebar w-full md:w-[304px] md:flex-shrink-0 flex justify-center md:justify-start">
            <VotingSidebar
              className="sticky top-4 w-full max-w-[304px]"
              votingCardProps={votingCardProps!}
              votingColumnProps={votingColumnProps}
              votingRedirectProps={votingRedirectProps!}
              proposalId={proposalId}
              citizen={citizen}
              citizenEligibility={citizenEligibility}
              proposalType={proposalData.proposalType}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProposalPage

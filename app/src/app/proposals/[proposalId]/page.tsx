import { notFound } from "next/navigation"
import Breadcrumbs from "@/app/proposals/components/Breadcrumbs"
import ProposalContent from "@/app/proposals/components/proposalContent/ProposalContent"
import VotingSidebar from "@/app/proposals/components/VotingSidebar/VotingSidebar"
import ProposalHeader from "@/app/proposals/components/ProposalHeader"

import {
  ProposalPageDataInterface,
  getVotingProps,
} from "@/app/proposals/utils/votingUtils"

import { getProposal } from "@/lib/proposals"
import { auth } from "@/auth"
import { getUserById } from "@/db/users"
import { getCitizenByType } from "@/db/citizens"

interface PageProps {
  params: {
    proposalId: string
  }
}

const CURRENT_DATETIME = new Date()

const Page = async (params: PageProps) => {
  // Get the proposals page

  const { proposalId } = params.params

  const proposalIdData = proposalId !== undefined

  if (!proposalIdData) {
    return notFound()
  }
  const proposalData = await getProposal(proposalId)

  // console.log("proposalData: ", proposalData)
  const session = await auth()
  const userId = session?.user.id ?? ""
  const user = await getUserById(userId)
  const primaryAddress = user?.addresses.filter((address) => address.primary)[0]
  let userAddress = primaryAddress?.address
  let citizen: any = null
  if (userAddress) {
    citizen = await getCitizenByType({ type: "user", id: userId })
  }

  console.log("user: ", user)
  console.log("userAddress: ", userAddress)
  console.log("citizen: ", citizen)

  const userSignedIn = userId !== undefined || userId !== ""
  const userCitizen = citizen !== null && citizen.attestationId !== undefined

  // Date Info
  const proposalStartDate = new Date(proposalData.startTime)
  const proposalEndDate = new Date(proposalData.endTime)
  const votingOpen =
    proposalStartDate < CURRENT_DATETIME && proposalEndDate > CURRENT_DATETIME
  const votingComplete = CURRENT_DATETIME > proposalEndDate

  // Breadcrumbs
  const breadcrumbs = ["Proposals", proposalData.proposalType]

  // Voting Info
  const voted = false
  const votingRecord = ["2"]

  const citizenEligibility = {
    organization: {
      name: "Org 1",
      logo: "https://i.imgur.com/0000000.png",
      eligible: false,
    },
    application: {
      name: "App 1",
      logo: "https://i.imgur.com/0000000.png",
      eligible: false,
    },
    user: {
      eligible: true,
      pfp: "https://i.imgur.com/0000000.png",
    },
  }

  const proposalPageData: ProposalPageDataInterface = {
    signedIn: userSignedIn,
    citizen: userCitizen,
    citizenId: citizen?.id,
    votingOpen: votingOpen,
    votingComplete: votingComplete,
    voted: voted,
    votingRecord: votingRecord,
    startDate: proposalStartDate,
    endDate: proposalEndDate,
    proposalType: proposalData.proposalType,
    proposalId: proposalId,
    citizenEligibility: citizenEligibility,
  }

  const { votingCardProps, votingColumnProps, votingRedirectProps } =
    getVotingProps(proposalPageData)

  // console.log("proposalPageData: ", proposalPageData)
  // console.log("votingCardProps: ", votingCardProps)
  // console.log("votingColumnProps: ", votingColumnProps)

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

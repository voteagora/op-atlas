import { notFound } from "next/navigation"
import Breadcrumbs from "@/app/proposals/components/Breadcrumbs"
import ProposalContent from "@/app/proposals/components/proposalContent/ProposalContent"
import VotingSidebar from "@/app/proposals/components/VotingSidebar/VotingSidebar"
import ProposalHeader from "@/app/proposals/components/ProposalHeader"
import votingCard, {
  VotingCardProps,
} from "@/app/proposals/components/VotingSidebar/votingCard/VotingCard"
import { ProposalType } from "@/lib/types"
import { addDays } from "date-fns"
import { VotingColumnProps } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"

interface PageProps {
  params: {
    proposalId: string
  }
}

interface CardType {
  signedIn: boolean
  citizen: boolean
  voted: boolean
  votingOpen: boolean
  votingComplete: boolean
  startDate: Date
  endDate: Date
  proposalType: ProposalType
}
const CURRENT_DATE = new Date()

// This section captured different end states for the voting sidebar.
// Different logical flows capture various sidebar configurations.

const comingSoon = (startDate: Date, endDate: Date) => {
  return {
    cardText: {
      title: "Coming Soon",
      descriptionElement: `Voting ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    },
  }
}

const votingEnded = (endDate: Date, result: any) => {
  return {
    cardText: {
      title: `Ended ${endDate}`,
      descriptionElement: result,
    },
  }
}

const youVoted = () => {
  return {
    cardText: {
      title: "You voted!",
      description: "Thanks for your participation.",
    },
  }
}

const castYourVote = (proposalType: ProposalType) => {
  const proposalTypeDescription = () => {
    switch (proposalType) {
      case "APPROVAL":
        return (
          <p>
            This election uses{" "}
            <span>
              <a href="https://todo" target="_blank">
                approval
              </a>
            </span>{" "}
            voting, meaning voter can approve more than one candidate.
          </p>
        )
      default:
        return ""
    }
  }

  return {
    cardText: {
      title: "Cast your citizen vote",
      descriptionElement: proposalTypeDescription(),
    },
  }
}

const getVotingCardProps = (
  cardType: CardType,
): VotingCardProps | undefined => {
  // If voting has not opened yet
  if (!cardType.votingOpen && !cardType.votingComplete) {
    comingSoon(cardType.startDate, cardType.endDate)
  }

  const getOpenVotingTypes = (cardType: CardType) => {
    if (cardType.voted) {
      return youVoted()
    }
    return castYourVote(cardType.proposalType)
  }

  const getCitizenTypes = (cardType: CardType) => {
    if (cardType.votingOpen) {
      return getOpenVotingTypes(cardType)
    } else if (cardType.votingComplete) {
      return votingEnded(cardType.endDate, "TODO")
    }
  }

  const getNonCitizenTypes = (cardType: CardType) => {
    return {
      cardText: {
        title: "TODO",
        description: "TODO",
      },
    }
  }

  if (!cardType.signedIn) {
    return castYourVote(cardType.proposalType)
  }
  if (cardType.citizen) {
    return getCitizenTypes(cardType)
  }
  return getNonCitizenTypes(cardType)
}

const getVotingColumnProps = (cardType: CardType): VotingColumnProps => {
  return {
    candidates: Array(8).fill({
      name: "Username",
      image: {
        src: "https://i.imgur.com/0000000.png",
        alt: "Image",
      },
      organizations: ["Org 1", "Org 2", "Org 3"],
      buttonLink: "https://google.com",
    }),
  }
}

const Page = (params: PageProps) => {
  // Get the proposals page

  const { proposalId } = params.params

  const proposalIdData = proposalId !== undefined

  if (!proposalIdData) {
    return notFound()
  }

  const MOCK = {
    breadcrumbs: ["Proposals", "Audit Request Team"],
    title: "Developer Advisory Board: Audit Request Team",
    status: "Nominations [Start Date] - [End Date]",
    description:
      "# Developer Advisory Board: Audit Request Team\n\n" +
      "## Roles & Responsibilities\n\n" +
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n" +
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n" +
      "* **Responsibility** for reviewing and auditing smart contracts\n" +
      "* **Leadership** in maintaining security standards\n" +
      "* **Collaboration** with development teams across projects",
    votingCardProps: {
      cardText: {
        title: "It's time to vote",
        description:
          "This election uses approval voting, meaning voter can approve more than one candidate.",
      },
      cardActions: {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Sign In",
            actionType: "Log",
          },
          {
            buttonStyle: "button-secondary",
            actionText: "Learn about approval voting",
            actionType: "Log",
          },
        ],
      },
    },
    votingColumnProps: {
      candidates: Array(8).fill({
        name: "Username",
        image: {
          src: "https://i.imgur.com/0000000.png",
          alt: "Image",
        },
        organizations: ["Org 1", "Org 2", "Org 3"],
        buttonLink: "https://google.com",
      }),
      votingActions: {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Sign In",
            actionType: "Log",
          },
        ],
      },
    },
  }

  const user = {
    userId: "1",
    citizenId: "1",
  }

  const userSignedIn = user.userId !== undefined
  const userCitizen = user.citizenId !== undefined
  const voted = false
  const votingOpen = false
  const votingComplete = true
  const startDate = addDays(CURRENT_DATE, -10)
  const endDate = addDays(CURRENT_DATE, -1)
  const pType = "APPROVAL" as ProposalType

  const votingCardType = {
    signedIn: false,
    citizen: userCitizen,
    voted: voted,
    votingOpen: votingOpen,
    votingComplete: votingComplete,
    startDate: startDate,
    endDate: endDate,
    proposalType: pType,
  }
  const votingCardData = getVotingCardProps(votingCardType)
  const votingColumnProps = getVotingColumnProps(votingCardType)

  console.log("votingCardType: ", votingCardType)
  console.log("votingCardData: ", votingCardData)
  console.log(`Voting Column Props: ${votingColumnProps}`)

  return (
    <main className="flex w-full h-full pb-[160px] gap-[80px] mx-auto items-center">
      <div className="flex flex-col w-2/3 mt-24 h-[865px] gap-[48px] mx-auto">
        <div className="flex flex-col gap-[44px]">
          <div className="flex justify-between items-start flex-col md:flex-row">
            <div className="w-full flex flex-col gap-[44px] mb-8 md:mb-0">
              <Breadcrumbs values={MOCK.breadcrumbs} />
              <ProposalHeader title={MOCK.title} status={MOCK.status} />
              <ProposalContent description={MOCK.description} />
            </div>
            <div className="w-full md:w-[304px] md:ml-12">
              <VotingSidebar
                className="sticky top-4"
                votingColumnProps={votingColumnProps}
                votingCardProps={votingCardData!}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page

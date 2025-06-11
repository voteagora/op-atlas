import { ProposalType } from "@/lib/types"
import {
  CardTextProps,
  VotingCardProps,
} from "@/app/proposals/components/VotingSidebar/votingCard/VotingCard"
import { VotingColumnProps } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"
import { VotingRedirectProps } from "@/app/proposals/components/VotingSidebar/VotingRedirect"
import { boolean, undefined } from "zod"

const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL

export interface CardType {
  signedIn: boolean
  citizen: boolean
  votingOpen: boolean
  votingComplete: boolean
  voted: boolean
  votingRecord?: string[]
  startDate: Date
  endDate: Date
  proposalType: ProposalType
  proposalId: string
  citizenEligibility: CitizenEligibility
}

export interface CitizenEligibility {
  organization?: {
    name: string
    logo: string
    eligible: boolean
  }
  application?: {
    name: string
    logo: string
    eligible: boolean
  }
  user: {
    eligible: boolean
    pfp: string
  }
}
// Helper functions for voting card props
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
      title: `Ended ${endDate.toLocaleDateString()}`,
      descriptionElement: result,
    },
  }
}

const youVoted = () => {
  return {
    cardText: {
      title: "You voted!",
      descriptionElement: "Thanks for your participation.",
    },
  }
}

const castYourVote = (proposalType: ProposalType, customTitle?: string) => {
  const proposalTypeDescription = () => {
    switch (proposalType) {
      case "APPROVAL":
        return "This election uses approval voting, meaning voter can approve more than one candidate."
      case "STANDARD":
        // TODO link 'here'
        return "This proposal requires approval from the Citizen's House and Token House. Read more about the voting mechanism here."
      case "OFFCHAIN_OPTIMISTIC":
        return "If you do not wish to veto, then no action is required."
      default:
        return ""
    }
  }

  return {
    cardText: {
      title: customTitle ? customTitle : "Cast your citizen vote",
      descriptionElement: proposalTypeDescription(),
    },
  }
}

const wantToVote = (eligibility: CitizenEligibility) => {
  const eligibleStatement =
    "eligible to become a citizen, and to vote on decisions that shape the Collective."

  let cardText: CardTextProps = {
    title: "Want to vote?",
  }
  if (eligibility.organization?.eligible) {
    return {
      cardText: {
        ...cardText,
        descriptionElement: `${eligibility.organization?.name} is ${eligibleStatement}`,
      },
      cardImage: {
        src: eligibility.organization.logo,
        alt: "Organization Logo",
        styling: "rounded-full w-[64px] h-[64px] radius-[Dimensions/19]",
      },
    }
  } else if (eligibility.application?.eligible) {
    return {
      cardText: {
        ...cardText,
        descriptionElement: `${eligibility.application?.name} is ${eligibleStatement}`,
      },
      cardImage: {
        src: eligibility.application.logo,
        alt: "Application Logo",
        styling: "rounded-lg w-[64px] h-[64px] radius-[Dimensions/19]",
      },
    }
  } else if (eligibility.user.eligible) {
    return {
      cardText: {
        ...cardText,
        descriptionElement: "You are " + eligibleStatement,
      },
      cardImage: {
        src: eligibility.user.pfp,
        alt: "User Profile Picture",
        styling: "rounded-full w-[64px] h-[64px] radius-[Dimensions/5]",
      },
    }
  } else {
    return {
      cardText: {
        ...cardText,
        descriptionElement:
          "The Citizens' House votes on decisions that shape the direction of the Collective.",
      },
    }
  }
}

const getOpenVotingTypes = (cardType: CardType) => {
  if (cardType.voted) {
    return youVoted()
  }
  if (cardType.proposalType === "OFFCHAIN_OPTIMISTIC") {
    // Custom proposal title for the offchain optimistic proposal
    return castYourVote(
      cardType.proposalType,
      "Do you want to override the decision?",
    )
  }
  return castYourVote(cardType.proposalType)
}

const getCitizenTypes = (cardType: CardType) => {
  if (cardType.votingOpen) {
    return getOpenVotingTypes(cardType)
  } else if (cardType.votingComplete) {
    return votingEnded(cardType.endDate, "This proposal has [TODO]")
  }
}

const getNonCitizenTypes = (cardType: CardType) => {
  switch (cardType.proposalType) {
    case "APPROVAL":
      return castYourVote(cardType.proposalType)
    case "STANDARD":
      return wantToVote(cardType.citizenEligibility)
    case "OFFCHAIN_OPTIMISTIC":
      return wantToVote(cardType.citizenEligibility)
    default:
      return {} as VotingCardProps
  }
}

// Function to get vote options
const getVoteOptions = () => {
  return Array(8).fill({
    name: "Username",
    image: {
      src: "https://i.imgur.com/0000000.png",
      alt: "Image",
    },
    organizations: ["Org 1", "Org 2", "Org 3"],
    buttonLink: "https://google.com",
  })
}

/**
 * Get the voting card props based on the card type
 * @param cardType The card type containing information about the voting state
 * @returns The voting card props
 */
export const getVotingCardProps = (
  cardType: CardType,
): VotingCardProps | undefined => {
  // If voting has not opened yet
  if (!cardType.votingOpen && !cardType.votingComplete) {
    return comingSoon(cardType.startDate, cardType.endDate)
  }

  if (!cardType.signedIn) {
    if (cardType.proposalType === "OFFCHAIN_OPTIMISTIC") {
      // Special case for the offchain optimistic proposal
      return {
        cardText: {
          title: "Cast your citizen vote",
          descriptionElement:
            "The proposal will automatically pass unless the Token House and Citizens' House choose to veto it.",
        },
      }
    }
    return castYourVote(cardType.proposalType)
  }
  if (cardType.citizen) {
    return getCitizenTypes(cardType)
  }
  return getNonCitizenTypes(cardType)
}

/**
 * Get the voting actions based on the card type
 * @param cardType
 * @returns Object containing the voting actions
 */
const getVotingActions = (cardType: CardType) => {
  let votingActions: any = {}
  if (!cardType.signedIn) {
    votingActions = {
      cardActionList: [
        {
          buttonStyle: "button-primary",
          actionText: "Sign In",
          actionType: "Log",
        },
      ],
    }
    // The user is not a citizen
  } else if (!cardType.citizen) {
    // Get the eligibility of the citizen
    const organizationEligible =
      cardType.citizenEligibility.organization?.eligible
    const applicationEligible =
      cardType.citizenEligibility.application?.eligible
    const userEligible = cardType.citizenEligibility.user.eligible

    if (organizationEligible || applicationEligible || userEligible) {
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Register",
            actionType: "Log",
          },
          {
            buttonStyle: "button-secondary",
            actionText: "Learn more",
            actionType: "Log",
          },
        ],
      }
    } else {
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Learn how to become a citizen",
            actionType: "Log",
          },
        ],
      }
    }
    // If the user is a citizen and has voted
  } else if (cardType.voted) {
    switch (cardType.votingRecord![0]) {
      case "0":
        votingActions = {
          cardActionList: [
            {
              buttonStyle:
                "bg-[#D6FFDA] text-success-foreground pointer-events-none cursor-none",
              actionText: "✔ For",
              actionType: "Disabled",
            },
          ],
        }
        break
      case "1":
        votingActions = {
          cardActionList: [
            {
              buttonStyle: "bg-[#F2F3F8] pointer-events-none cursor-none",
              actionText: "Abstain",
              actionType: "Disabled",
            },
          ],
        }
        break
      case "2":
        votingActions = {
          cardActionList: [
            {
              buttonStyle:
                "bg-red-200 text-red-600 pointer-events-none cursor-none",
              actionText: "x Against",
              actionType: "Disabled",
            },
          ],
        }
        break
    }
  } else {
    if (cardType.proposalType === "OFFCHAIN_OPTIMISTIC") {
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Cast Vote",
            actionType: "Log",
          },
        ],
      }
    } else {
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Cast Vote",
            actionType: "Vote",
          },
        ],
      }
    }
  }

  return votingActions
}

/**
 * Get the voting column props based on the card type
 * @param cardType The card type containing information about the voting state
 * @returns The voting column props
 */
export const getVotingColumnProps = (cardType: CardType): VotingColumnProps => {
  let votingActions = getVotingActions(cardType)

  let votingColumnProps: any = {
    proposalType: cardType.proposalType,
    votingActions: votingActions,
    currentlyActive: cardType.votingOpen,
    userSignedIn: cardType.signedIn,
    userVoted: cardType.voted,
    userCitizen: cardType.citizen,
    resultsLink: `${API_URL}/${cardType.proposalId}`,
  }

  switch (cardType.proposalType) {
    case "APPROVAL":
      votingColumnProps = { ...votingColumnProps, options: getVoteOptions() }
      break
    case "STANDARD":
      votingColumnProps = {
        ...votingColumnProps,
      }
      break
    case "OFFCHAIN_OPTIMISTIC":
      votingColumnProps = {
        ...votingColumnProps,
      }
  }
  return votingColumnProps as VotingColumnProps
}

const getVotingRedirectProps = (cardType: CardType): VotingRedirectProps => {
  return {
    callout: "Are you a delegate?",
    link: {
      linkText: "Vote here",
      linkHref: `${API_URL}/${cardType.proposalId}`,
    },
  }
}

/**
 * Get all voting props based on the card type
 * @param cardType The card type containing information about the voting state
 * @returns An object containing both voting card props and voting column props
 */
export const getVotingProps = (cardType: CardType) => {
  return {
    votingCardProps: getVotingCardProps(cardType),
    votingColumnProps: getVotingColumnProps(cardType),
    votingRedirectProps: getVotingRedirectProps(cardType),
  }
}

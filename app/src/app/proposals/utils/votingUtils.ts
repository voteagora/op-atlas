import { ProposalType } from "@/lib/types"
import { VotingCardProps } from "@/app/proposals/components/VotingSidebar/votingCard/VotingCard"
import { VotingColumnProps } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"
import { VotingRedirectProps } from "@/app/proposals/components/VotingSidebar/VotingRedirect"
import { undefined } from "zod"

export interface CardType {
  signedIn: boolean
  citizen: boolean
  voted: boolean
  votingOpen: boolean
  votingComplete: boolean
  startDate: Date
  endDate: Date
  proposalType: ProposalType
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

const castYourVote = (proposalType: ProposalType) => {
  const proposalTypeDescription = () => {
    switch (proposalType) {
      case "APPROVAL":
        return "This election uses approval voting, meaning voter can approve more than one candidate."
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
  return castYourVote(cardType.proposalType)
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
    return castYourVote(cardType.proposalType)
  }
  if (cardType.citizen) {
    return getCitizenTypes(cardType)
  }
  return getNonCitizenTypes(cardType)
}

/**
 * Get the voting column props based on the card type
 * @param cardType The card type containing information about the voting state
 * @returns The voting column props
 */
export const getVotingColumnProps = (cardType: CardType): VotingColumnProps => {
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
  } else if (!cardType.citizen) {
    votingActions = {
      cardActionList: [
        {
          buttonStyle:
            "button-primary opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:hover:opacity-50",
          actionText: "Cast Vote",
          actionType: "Disabled",
        },
      ],
    }
  } else {
    votingActions = {
      cardActionList: [
        {
          buttonStyle: "button-primary",
          actionText: "Cast Vote",
          actionType: "Log",
        },
      ],
    }
  }

  switch (cardType.proposalType) {
    case "APPROVAL":
      return {
        candidates: getVoteOptions(),
        votingActions: votingActions,
      }
    default:
      return {
        candidates: getVoteOptions(),
      }
  }
}

const getVotingRedirectProps = (cardType: CardType): VotingRedirectProps => {
  return {
    callout: "Are you a delegate?",
    link: {
      linkText: "Vote here",
      linkHref: "todo",
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

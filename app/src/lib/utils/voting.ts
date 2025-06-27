import {
  ProposalType,
  VoteType,
  VotingCardProps,
} from "@/components/proposals/proposal.types"
import { ProposalData } from "@/lib/proposals"

import { CitizenshipQualification } from "@/lib/types"
import { JsonValue } from "@prisma/client/runtime/library"

const API_URL = process.env.NEXT_PUBLIC_AGORA_API_URL

// Helper functions for voting card props
const comingSoon = (proposalData: ProposalData) => {
  const startDate = new Date(proposalData.createdTime)
  const endDate = new Date(proposalData.endTime)
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

const youVoted = (proposalData: ProposalData, vote: VoteType) => {
  return {
    cardText: {
      title: "You voted",
      descriptionElement: `Your vote can take up to 5 minutes to publish on Agora.`,
    },
    previousVote: mapValueToVoteType(proposalData.proposalType, vote),
  }
}

const castYourVote = (proposalType: ProposalType, customTitle?: string) => {
  const proposalTypeDescription = () => {
    switch (proposalType) {
      case ProposalType.OFFCHAIN_APPROVAL:
        return "This election uses approval voting, meaning voter can approve more than one candidate."
      case ProposalType.OFFCHAIN_STANDARD:
        return "OFFCHAIN_STANDARD"
      case ProposalType.OFFCHAIN_OPTIMISTIC:
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

const wantToVote = (eligibility: CitizenshipQualification | null) => {
  const eligibleStatement =
    "eligible to become a citizen, and to vote on decisions that shape the Collective."

  const cardText = {
    title: "Want to vote?",
  }

  // If Eligibility is null, then the user is not eligible to vote
  if (!eligibility || !eligibility.eligible) {
    return {
      cardText: {
        ...cardText,
        descriptionElement:
          "The Citizens' House votes on decisions that shape the direction of the Collective.",
      },
    }
  } else {
    if (eligibility.type === "user") {
      return {
        cardText: {
          ...cardText,
          descriptionElement: "You are " + eligibleStatement,
        },
      }
    } else {
      return {
        cardText: {
          ...cardText,
          descriptionElement: `${eligibility.title} is ${eligibleStatement}`,
        },
      }
    }
  }
}

const getOpenVotingTypes = (proposalData: ProposalData, vote?: VoteType) => {
  if (vote) {
    return youVoted(proposalData, vote)
  }
  if (proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC) {
    // Custom proposal title for the offchain optimistic proposal
    return castYourVote(
      proposalData.proposalType,
      "Do you want to override the decision?",
    )
  }
  return castYourVote(proposalData.proposalType)
}

const getCitizenTypes = (proposalData: ProposalData, vote?: VoteType) => {
  if (proposalData.status === "ACTIVE") {
    return getOpenVotingTypes(proposalData, vote)
  } else if (new Date(proposalData.endTime) < new Date()) {
    return votingEnded(
      new Date(proposalData.endTime),
      `This proposal has ${proposalData.status}`,
    )
  } else {
    return comingSoon(proposalData)
  }
}

const getNonCitizenTypes = (
  proposalData: ProposalData,
  eligibility: CitizenshipQualification,
) => {
  switch (proposalData.proposalType) {
    case ProposalType.OFFCHAIN_APPROVAL:
      return castYourVote(proposalData.proposalType)
    case ProposalType.OFFCHAIN_STANDARD:
      return wantToVote(eligibility)
    case ProposalType.OFFCHAIN_OPTIMISTIC:
      return wantToVote(eligibility)
    default:
      return {} as VotingCardProps
  }
}

// Function to get vote options
const getVoteOptions = () => {
  // TODO: For approval voting
  // return Array(8).fill({
  //   name: "Username",
  //   image: {
  //     src: "https://i.imgur.com/0000000.png",
  //     alt: "Image",
  //   },
  //   organizations: ["Org 1", "Org 2", "Org 3"],
  //   buttonLink: "https://google.com",
  // })
  return []
}

/**
 * Get the voting card props based on the card type
 * @param proposalData The card type containing information about the voting state
 * @returns The voting card props
 */
export const getVotingCardProps = (
  proposalData: ProposalData,
  isCitizen: boolean,
  vote?: VoteType,
  eligibility?: CitizenshipQualification,
): VotingCardProps => {
  // If voting has not opened yet
  if (proposalData.status === "PENDING") {
    return {
      ...comingSoon(proposalData),
    }
  }

  if (!isCitizen) {
    if (proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC) {
      // Special case for the offchain optimistic proposal
      return {
        cardText: {
          title: "Cast your citizen vote",
          descriptionElement:
            "The proposal will automatically pass unless the Token House and Citizens' House choose to veto it.",
        },
      }
    }
  }
  if (isCitizen) {
    return {
      ...getCitizenTypes(proposalData, vote),
    }
  }
  return {
    ...getNonCitizenTypes(proposalData, eligibility!),
  }
}

/**
 * Get the voting actions based on the card type
 * @param isSignedIn
 * @param isRegisteredCitizen
 * @param isEligibleCitizen
 * @param vote
 * @returns Object containing the voting actions
 */
export const getVotingActions = (
  isSignedIn: boolean,
  isRegisteredCitizen: boolean,
  isEligibleCitizen: boolean,
) => {
  if (!isSignedIn) {
    return {
      cardActionList: [
        {
          buttonStyle: "button-primary",
          actionText: "Sign In",
          actionType: "sign in",
        },
      ],
    }
    // The user is not a citizen
  } else if (!isRegisteredCitizen) {
    // Get the eligibility of the citizen

    if (isEligibleCitizen) {
      return {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Register",
            actionType: "Register",
          },
          {
            buttonStyle: "button-secondary",
            actionText: "Learn more",
            actionType: "Learn More",
          },
        ],
      }
    } else {
      return {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Learn how to become a citizen",
            actionType: "Learn More",
          },
        ],
      }
    }
  } else {
    return {
      cardActionList: [
        {
          buttonStyle: "button-primary",
          actionText: "Cast vote",
          actionType: "Vote",
        },
      ],
    }
  }
}

export const getAgoraProposalLink = (proposalId: string) => {
  return `${API_URL}/proposals/${proposalId}`
}

/**
 * Get all voting props based on the card type
 * @param proposalData The card type containing information about the voting state
 * @returns An object containing both voting card props and voting column props
 */
export const getVotingProps = (
  proposalData: ProposalData,
  isCitizen: boolean,
  vote?: VoteType,
  eligibility?: CitizenshipQualification,
) => {
  return {
    votingCardProps: getVotingCardProps(
      proposalData,
      isCitizen,
      vote,
      isCitizen ? eligibility : undefined,
    ),
  }
}

export const mapVoteTypeToValue = (
  proposalType: ProposalType,
  voteType: VoteType,
) => {
  if (proposalType === ProposalType.OFFCHAIN_STANDARD) {
    switch (voteType) {
      case VoteType.Against:
        return ["0"]
      case VoteType.For:
        return ["1"]
      case VoteType.Abstain:
        return ["2"]
      default:
        return []
    }
  } else {
    return [voteType]
  }
}

export const mapValueToVoteType = (
  proposalType: ProposalType,
  value: JsonValue,
) => {
  const valueArray = Array.isArray(value) ? value : [value]

  if (proposalType === ProposalType.OFFCHAIN_STANDARD) {
    switch (valueArray[0]) {
      case "0":
        return VoteType.Against
      case "1":
        return VoteType.For
      case "2":
        return VoteType.Abstain
      default:
        return VoteType.Abstain
    }
  }
}

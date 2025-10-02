import { JsonValue } from "@prisma/client/runtime/library"

import {
  ProposalStatus,
  ProposalType,
  VoteType,
  VotingCardProps,
} from "@/components/proposals/proposal.types"
import { ProposalData } from "@/lib/proposals"
import { CitizenshipQualification } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_AGORA_API_URL

// Helper functions for voting card props
const defaultCardText = (proposalData?: ProposalData) => {
  if (proposalData) {
    switch (proposalData.proposalType) {
      case ProposalType.OFFCHAIN_STANDARD:
      case ProposalType.HYBRID_STANDARD:
        return {
          cardText: {
            title: "Cast your citizen vote",
            // Use marker so VotingCard renders the hyperlink with underline and period
            descriptionElement: "OFFCHAIN_STANDARD",
          },
        }
      case ProposalType.OFFCHAIN_OPTIMISTIC:
      case ProposalType.HYBRID_OPTIMISTIC_TIERED:
        return {
          cardText: {
            title: "Cast your citizen vote",
            descriptionElement:
              "This proposal will automatically pass unless the Token House and Citizens' House choose to veto it.",
          },
        }
      default:
        return {
          cardText: {
            title: "Cast your citizen vote",
            descriptionElement: "",
          },
        }
    }
  }
  // Fallback to just title
  return {
    cardText: {
      title: "Cast your citizen vote",
      descriptionElement: "",
    },
  }
}

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
  if (
    proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC ||
    proposalData.proposalType === ProposalType.HYBRID_OPTIMISTIC_TIERED ||
    proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC_TIERED
  ) {
    const isVeto = vote === VoteType.Against
    return {
      cardText: {
        title: isVeto ? "You vetoed the decision" : "You voted ‘no veto’",
        descriptionElement: `Your vote can take up to 5 minutes to publish on Agora.`,
        needsAgoraLink: true,
        proposalId: proposalData.id,
      },
    }
  }
  return {
    cardText: {
      title: "You voted",
      descriptionElement: `Your vote can take up to 5 minutes to publish on Agora.`,
      needsAgoraLink: true,
      proposalId: proposalData.id,
    },
    previousVote: mapValueToVoteType(proposalData.proposalType, vote),
  }
}

const castYourVote = (proposalType: ProposalType, customTitle?: string) => {
  const proposalTypeDescription = () => {
    switch (proposalType) {
      case ProposalType.OFFCHAIN_APPROVAL:
      case ProposalType.HYBRID_APPROVAL:
        return "This election uses approval voting, meaning voter can approve more than one candidate."
      case ProposalType.OFFCHAIN_STANDARD:
      case ProposalType.HYBRID_STANDARD:
        return "OFFCHAIN_STANDARD"
      case ProposalType.OFFCHAIN_OPTIMISTIC:
      case ProposalType.OFFCHAIN_OPTIMISTIC_TIERED:
      case ProposalType.HYBRID_OPTIMISTIC_TIERED:
        return "This proposal will automatically pass unless the Token House and Citizens’ House choose to veto it."
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
  if (
    proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC ||
    proposalData.proposalType === ProposalType.HYBRID_OPTIMISTIC_TIERED ||
    proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC_TIERED
  ) {
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
    // Special text for optimistic / override proposals
    if (proposalData.proposalType.includes("OPTIMISTIC")) {
      const statusText =
        proposalData.status === ProposalStatus.DEFEATED
          ? "This decision was vetoed"
          : "This decision stands"
      return votingEnded(new Date(proposalData.endTime), statusText)
    }
    const statusText =
      proposalData.status === ProposalStatus.DEFEATED
        ? `been ${proposalData.status}`
        : `${proposalData.status}`
    return votingEnded(
      new Date(proposalData.endTime),
      `This proposal has ${statusText}`,
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
    case ProposalType.HYBRID_APPROVAL:
      return castYourVote(proposalData.proposalType)
    case ProposalType.OFFCHAIN_STANDARD:
      return wantToVote(eligibility)
    case ProposalType.OFFCHAIN_OPTIMISTIC:
      return wantToVote(eligibility)
    default:
      return defaultCardText()
  }
}

/**
 * Get the voting card props based on the card type
 * @param proposalData The card type containing information about the voting state
 * @param isCitizen Whether the user is a citizen
 * @param vote VoteType if the user voted
 * @param eligibility citizenship qualification details
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
    if (
      proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC ||
      proposalData.proposalType === ProposalType.HYBRID_OPTIMISTIC_TIERED ||
      proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC_TIERED
    ) {
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

  if (eligibility) {
    return {
      ...getNonCitizenTypes(proposalData, eligibility),
    }
  }

  // Fallback
  return defaultCardText(proposalData)
}

/**
 * Get the voting actions based on the card type
 * @param isSignedIn
 * @param isRegisteredCitizen
 * @param isEligibleCitizen
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
 * @param isCitizen Whether the user is a citizen
 * @param vote VoteType if the user voted
 * @param eligibility citizenship qualification details
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
  selectedVotes: {
    voteType: VoteType
    selections?: number[]
  },
) => {
  if (
    proposalType === ProposalType.OFFCHAIN_STANDARD ||
    proposalType === ProposalType.HYBRID_STANDARD
  ) {
    switch (selectedVotes.voteType) {
      case VoteType.Against:
        return JSON.stringify([0])
      case VoteType.For:
        return JSON.stringify([1])
      case VoteType.Abstain:
        return JSON.stringify([2])
      default:
        return "[]"
    }
  } else if (
    proposalType === ProposalType.OFFCHAIN_OPTIMISTIC ||
    proposalType === ProposalType.HYBRID_OPTIMISTIC_TIERED ||
    proposalType === ProposalType.OFFCHAIN_OPTIMISTIC_TIERED
  ) {
    // UI uses VoteType.Against to represent a Veto selection. Treat it as Veto here.
    return selectedVotes.voteType === VoteType.Against
      ? JSON.stringify([0]) // Veto
      : JSON.stringify([2]) // No veto (Abstain)
  } else if (
    proposalType === ProposalType.OFFCHAIN_APPROVAL ||
    proposalType === ProposalType.HYBRID_APPROVAL
  ) {
    // Sort lowest to highest to maintain the index location for voting
    const sortedSelections = selectedVotes.selections?.sort((a, b) => a - b)
    return selectedVotes.selections ? `[[${sortedSelections}],[1]]` : "[[],[0]]"
  } else {
    return JSON.stringify([selectedVotes.voteType])
  }
}

export const mapValueToVoteType = (
  proposalType: ProposalType,
  value: JsonValue,
): { voteType: VoteType; selections?: number[] } | null => {
  const valueArray = Array.isArray(value) ? value : [value]
  if (
    proposalType === ProposalType.OFFCHAIN_STANDARD ||
    proposalType === ProposalType.HYBRID_STANDARD
  ) {
    switch (valueArray[0]) {
      case 0:
        return { voteType: VoteType.Against }
      case 1:
        return { voteType: VoteType.For }
      case 2:
        return { voteType: VoteType.Abstain }
      default:
        return { voteType: VoteType.Abstain }
    }
  } else if (
    proposalType === ProposalType.OFFCHAIN_OPTIMISTIC ||
    proposalType === ProposalType.HYBRID_OPTIMISTIC_TIERED ||
    proposalType === ProposalType.OFFCHAIN_OPTIMISTIC_TIERED
  ) {
    if (valueArray[0] === "0") return { voteType: VoteType.Against }
    return { voteType: VoteType.Abstain }
  } else if (
    proposalType === ProposalType.OFFCHAIN_APPROVAL ||
    proposalType === ProposalType.HYBRID_APPROVAL
  ) {
    return { voteType: VoteType.Approval, selections: valueArray as number[] }
  }
  return null
}

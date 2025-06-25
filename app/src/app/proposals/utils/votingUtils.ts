import {
  ProposalPageDataInterface,
  ProposalType,
  VoteType,
  VotingColumnProps,
  VotingRedirectProps,
} from "@/components/proposals/proposal.types"
import {
  CardTextProps,
  VotingCardProps,
} from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"
import { CitizenshipQualification } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_AGORA_API_URL

// Helper functions for voting card props
const comingSoon = (proposalData: ProposalPageDataInterface) => {
  const startDate = new Date(proposalData.startDate)
  const endDate = new Date(proposalData.endDate)
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
      case ProposalType.OFFCHAIN_APPROVAL:
        return "This election uses approval voting, meaning voter can approve more than one candidate."
      case ProposalType.OFFCHAIN_STANDARD:
        // TODO link 'here'
        return "This proposal requires approval from the Citizen's House and Token House. Read more about the voting mechanism here."
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

  let cardText: CardTextProps = {
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

const getOpenVotingTypes = (proposalData: ProposalPageDataInterface) => {
  if (proposalData.voted) {
    return youVoted()
  }
  if (proposalData.proposalType === "OFFCHAIN_OPTIMISTIC") {
    // Custom proposal title for the offchain optimistic proposal
    return castYourVote(
      proposalData.proposalType,
      "Do you want to override the decision?",
    )
  }
  return castYourVote(proposalData.proposalType)
}

const getCitizenTypes = (proposalData: ProposalPageDataInterface) => {
  if (proposalData.votingOpen) {
    return getOpenVotingTypes(proposalData)
  } else if (proposalData.votingComplete) {
    return votingEnded(
      proposalData.endDate,
      `This proposal has ${proposalData.proposalStatus}`,
    )
  } else {
    return comingSoon(proposalData)
  }
}

const getNonCitizenTypes = (proposalData: ProposalPageDataInterface) => {
  switch (proposalData.proposalType) {
    case ProposalType.OFFCHAIN_APPROVAL:
      return castYourVote(proposalData.proposalType)
    case ProposalType.OFFCHAIN_STANDARD:
      return wantToVote(proposalData.citizenEligibility)
    case ProposalType.OFFCHAIN_OPTIMISTIC:
      return wantToVote(proposalData.citizenEligibility)
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
  proposalData: ProposalPageDataInterface,
): VotingCardProps | undefined => {
  // If voting has not opened yet
  if (!proposalData.votingOpen && !proposalData.votingComplete) {
    return {
      ...comingSoon(proposalData),
      user: proposalData.user,
    }
  }

  if (!proposalData.user) {
    if (proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC) {
      // Special case for the offchain optimistic proposal
      return {
        cardText: {
          title: "Cast your citizen vote",
          descriptionElement:
            "The proposal will automatically pass unless the Token House and Citizens' House choose to veto it.",
        },
        user: null,
      }
    }
    return {
      ...castYourVote(proposalData.proposalType),
      user: proposalData.user,
    }
  }
  if (proposalData.citizen) {
    return {
      ...getCitizenTypes(proposalData),
      user: proposalData.user,
    }
  }
  return {
    ...getNonCitizenTypes(proposalData),
    user: proposalData.user,
    eligibility: proposalData.citizenEligibility!,
  }
}

/**
 * Get the voting actions based on the card type
 * @param proposalData
 * @returns Object containing the voting actions
 */
const getVotingActions = (proposalData: ProposalPageDataInterface) => {
  let votingActions: any = {}
  if (!proposalData.user) {
    votingActions = {
      cardActionList: [
        {
          buttonStyle: "button-primary",
          actionText: "Sign In",
          actionType: "sign in",
        },
      ],
    }
    // The user is not a citizen
  } else if (!proposalData.citizen) {
    // Get the eligibility of the citizen

    if (proposalData.citizenEligibility?.eligible) {
      votingActions = {
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
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Learn how to become a citizen",
            actionType: "Learn More",
          },
        ],
      }
    }
    // If the user is a citizen and has voted
  } else if (proposalData.voted) {
    switch (proposalData.votingRecord![0]) {
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
    if (proposalData.proposalType === ProposalType.OFFCHAIN_OPTIMISTIC) {
      votingActions = {
        cardActionList: [
          {
            buttonStyle: "button-primary",
            actionText: "Cast Vote",
            actionType: "Vote",
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
 * @param proposalData The card type containing information about the voting state
 * @returns The voting column props
 */
export const getVotingColumnProps = (
  proposalData: ProposalPageDataInterface,
): VotingColumnProps => {
  let votingActions = getVotingActions(proposalData)

  let votingColumnProps: any = {
    proposalType: proposalData.proposalType,
    proposalId: proposalData.proposalId,
    votingActions: votingActions,
    currentlyActive: proposalData.votingOpen,
    userSignedIn: !!proposalData.user,
    userVoted: proposalData.voted,
    userCitizen: proposalData.citizen,
    citizenId: proposalData.citizen?.id,
    resultsLink: `${API_URL}/proposals/${proposalData.proposalId}`,
  }

  switch (proposalData.proposalType) {
    case ProposalType.OFFCHAIN_APPROVAL:
      votingColumnProps = { ...votingColumnProps, options: getVoteOptions() }
      break
    case ProposalType.OFFCHAIN_STANDARD:
      votingColumnProps = {
        ...votingColumnProps,
      }
      break
    case ProposalType.OFFCHAIN_OPTIMISTIC:
      votingColumnProps = {
        ...votingColumnProps,
      }
  }
  return votingColumnProps as VotingColumnProps
}

const getVotingRedirectProps = (
  proposalData: ProposalPageDataInterface,
): VotingRedirectProps => {
  return {
    callout: "Are you a delegate?",
    link: {
      linkText: "Vote here",
      linkHref: `${API_URL}/proposals/${proposalData.proposalId}`,
    },
  }
}

/**
 * Get all voting props based on the card type
 * @param proposalData The card type containing information about the voting state
 * @returns An object containing both voting card props and voting column props
 */
export const getVotingProps = (proposalData: ProposalPageDataInterface) => {
  return {
    votingCardProps: getVotingCardProps(proposalData),
    votingColumnProps: getVotingColumnProps(proposalData),
    votingRedirectProps: getVotingRedirectProps(proposalData),
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

"use client"
import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import StandardVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/StandardVoteCard"
import CandidateCards from "@/app/proposals/components/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/OverrideVoteCard"
import { useState } from "react"

// Vote type enum
export enum VoteType {
  For = "For",
  Abstain = "Abstain",
  Against = "Against",
  Veto = "Veto",
}

export interface CandidateCardProps {
  name: string
  image: {
    src: string
    alt?: string
  }
  organizations: string[]
  buttonLink: string
}

const ColumnCard = ({
  proposalType,
  options,
  signedIn,
  citizen,
  currentlyActive,
  voted,
  selectedVote,
  setSelectedVote,
}: {
  proposalType: string
  options?: CandidateCardProps[]
  signedIn?: boolean
  citizen?: boolean
  title?: string
  currentlyActive?: boolean
  voted?: boolean
  selectedVote?: VoteType | null
  setSelectedVote?: (vote: VoteType) => void
}) => {
  switch (proposalType) {
    case "STANDARD":
      // If the user is not signed-in we do not want to show the card
      if (!signedIn || !currentlyActive || voted || !citizen) {
        return <></>
      }
      return (
        <StandardVoteCard
          selectedVote={selectedVote!}
          setSelectedVote={setSelectedVote!}
        />
      )
    case "APPROVAL":
      return <CandidateCards candidates={options!} />
    case "OFFCHAIN_OPTIMISTIC":
      return <OverrideVoteCard />
    default:
      return <>TODO</>
  }
}

export interface VotingColumnProps {
  proposalType: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
  userSignedIn?: boolean
  userCitizen?: boolean
  userVoted?: boolean
  resultsLink: string
}

const VotingColumn = ({
  proposalType,
  options,
  votingActions,
  currentlyActive,
  userSignedIn,
  userCitizen,
  userVoted,
  resultsLink,
}: VotingColumnProps) => {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null)
  const handleVoteClick = (voteType: VoteType) => {
    setSelectedVote(voteType === selectedVote ? null : voteType)
  }

  const handleCastVote = () => {
    console.log(selectedVote)
  }

  return (
    <div className="w-[19rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] gap-[16px] flex flex-col ">
        <ColumnCard
          proposalType={proposalType}
          options={options}
          signedIn={userSignedIn}
          currentlyActive={currentlyActive}
          citizen={userCitizen}
          voted={userVoted}
          selectedVote={selectedVote}
          setSelectedVote={handleVoteClick}
        />
      </div>
      {currentlyActive && votingActions && (
        <VotingActions
          // This is a wonky way to overwrite the call to make an external call.
          cardActionList={votingActions.cardActionList.map((action) => {
            // If this is a vote action, replace its action function with handleCastVote
            if (action.actionType === "Vote") {
              return {
                ...action,
                action: handleCastVote,
              }
            }
            // Otherwise, return the original action unchanged
            return action
          })}
        />
      )}

      {!currentlyActive && (
        <div className="w-full flex items-center justify-center gap-2.5">
          <a href={resultsLink} target="_blank">
            <p className="font-inter font-normal text-sm leading-5 tracking-normal text-center underline decoration-solid decoration-0">
              View results
            </p>
          </a>
        </div>
      )}
    </div>
  )
}

export default VotingColumn

import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import StandardVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/StandardVoteCard"
import CandidateCards from "@/app/proposals/components/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/OverrideVoteCard"

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
}: {
  proposalType: string
  options?: CandidateCardProps[]
  signedIn?: boolean
  citizen?: boolean
  title?: string
  currentlyActive?: boolean
  voted?: boolean
}) => {
  switch (proposalType) {
    case "STANDARD":
      // If the user is not signed-in we do not want to show the card
      if (!signedIn || !currentlyActive || voted || !citizen) {
        return <></>
      }
      return <StandardVoteCard />
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
}

const VotingColumn = ({
  proposalType,
  options,
  votingActions,
  currentlyActive,
  userSignedIn,
  userCitizen,
  userVoted,
}: VotingColumnProps) => {
  console.log("Signed in: ", userSignedIn)
  console.log("Currently Active: ", currentlyActive)
  console.log("Voted: ", userVoted)
  console.log("Citizen: ", userCitizen)
  console.log("Voting Options: ", votingActions)
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
        />
      </div>
      {currentlyActive && votingActions && <VotingActions {...votingActions} />}
      {!currentlyActive && (
        // TODO! This needs to point somewhere
        <div className="w-full flex items-center justify-center gap-2.5">
          <a href="http://todo">
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

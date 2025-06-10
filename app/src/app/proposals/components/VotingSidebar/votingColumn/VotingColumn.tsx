import { ChevronLeft, ChevronRight } from "lucide-react"
import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import CandidateCard from "@/app/proposals/components/VotingSidebar/votingColumn/CandidateCard"
import StandardVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/StandardVoteCard"

// Vote type enum
export enum VoteType {
  For = "For",
  Abstain = "Abstain",
  Against = "Against",
}

interface CandidateCardProps {
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
}: {
  proposalType: string
  options?: CandidateCardProps[]
}) => {
  switch (proposalType) {
    case "STANDARD":
      return <StandardVoteCard />
    case "APPROVAL":
      return <CandidateCards candidates={options!} />
    default:
      return <>TODO</>
  }
}

const CandidateCards = ({
  candidates,
}: {
  candidates: CandidateCardProps[]
}) => {
  return (
    <div className="w-full sm:w-[272px]">
      {candidates.map((candidate, idx) => (
        <CandidateCard
          key={idx}
          img={candidate.image}
          username={candidate.name}
          organizations={candidate.organizations}
          buttonLink={candidate.buttonLink}
        />
      ))}
    </div>
  )
}

export interface VotingColumnProps {
  proposalType: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
}

const VotingColumn = ({
  proposalType,
  options,
  votingActions,
  currentlyActive,
}: VotingColumnProps) => {
  console.log("VotingActions: ", votingActions)
  return (
    <div className="w-[19rem] pt-[1.5rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] gap-[16px] flex flex-col">
        {proposalType === "APPROVAL" && (
          <p className="pl-2 pr-2 h-5">{options?.length} Candidates</p>
        )}

        <ColumnCard proposalType={proposalType} options={options} />
      </div>
      {votingActions && <VotingActions {...votingActions} />}
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

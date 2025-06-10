import CandidateCard from "@/app/proposals/components/VotingSidebar/votingColumn/CandidateCard"
import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"

export interface VotingColumnProps {
  proposalType: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
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
  if (proposalType === "APPROVAL") {
    return CandidateCards(options!)
  }
}

const CandidateCards = (candidates: CandidateCardProps[]) => {
  return (
    <div className="w-full sm:w-[272px] h-[320px]">
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

const VotingColumn = ({
  proposalType,
  options,
  votingActions,
  currentlyActive,
}: VotingColumnProps) => {
  console.log("VotingActions: ", votingActions)
  return (
    <div className="w-[19rem] min-h-[25.25rem] pt-[1.5rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] h-[356px] gap-[16px] flex flex-col">
        <p className="pl-2 pr-2 h-5">8 Candidates</p>
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

import CandidateCard from "@/app/proposals/components/VotingSidebar/votingColumn/CandidateCard"
import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"

export interface VotingColumnProps {
  candidates: CandidateCardProps[]
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

const VotingColumn = ({
  candidates,
  votingActions,
  currentlyActive,
}: VotingColumnProps) => {
  console.log("VotingActions: ", votingActions)
  return (
    <div className="w-[19rem] min-h-[25.25rem] pt-[1.5rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] h-[356px] gap-[16px] flex flex-col">
        <p className="pl-2 pr-2 h-5">8 Candidates</p>
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
      </div>
      {votingActions && <VotingActions {...votingActions} />}
      {!currentlyActive && (
        // TODO! This needs to point somewhere

        <div className="w-full flex items-center justify-center gap-2.5">
          <a href="http://todo">
            <p
              className="underline secondary-foreground"
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0%",
                textAlign: "center",
                textDecoration: "underline",
                textDecorationStyle: "solid",
                textDecorationOffset: "0%",
                textDecorationThickness: "0%",
              }}
            >
              View results
            </p>
          </a>
        </div>
      )}
    </div>
  )
}

export default VotingColumn

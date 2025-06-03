import CandidateCard from "@/app/proposals/components/VotingSidebar/votingColumn/CandidateCard"

export interface VotingColumnProps {
  candidates: CandidateCardProps[]
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

const VotingColumn = ({ candidates }: VotingColumnProps) => {
  console.log(candidates)
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
    </div>
  )
}

export default VotingColumn

import CandidateCard from "@/app/proposals/components/VotingSidebar/votingColumn/CandidateCard"

const MOCK_CANDIDATES = Array(8).fill({
  name: "Username",
  image: {
    src: "https://i.imgur.com/0000000.png",
    alt: "Image",
  },
  organizations: ["Org 1", "Org 2", "Org 3"],
  buttonLink: "https://google.com",
})

const VotingColumn = () => {
  return (
    <div className="w-[19rem] min-h-[25.25rem] pt-[1.5rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] h-[356px] gap-[16px] flex flex-col">
        <p className="pl-2 pr-2 h-5">8 Candidates</p>
        <div className="w-full sm:w-[272px] h-[320px]">
          {MOCK_CANDIDATES.map((candidate, idx) => (
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

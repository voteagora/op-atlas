import ProposalCard from "@/app/proposals/proposalsPage/components/ProposalCard"

const StandardProposals = () => {
  return (
    <div>
      <div>
        <h2 className="mb-4">Proposals</h2>
      </div>
      <div>
        <ProposalCard>
          <h3>Proposal 1</h3>
        </ProposalCard>
      </div>
    </div>
  )
}

export default StandardProposals

import { ProposalRow } from "./ProposalRow"
import { UIProposal } from "@/components/proposals/proposal.types"

interface StandardProposalsProps {
  proposals: UIProposal[]
}
const Proposals = ({ proposals }: StandardProposalsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="w-full font-semibold text-[20px] leading-7 align-middle text-text-default">
          Proposals
        </h4>
      </div>
      <div>
        {proposals.map((proposal, index) => (
          <ProposalRow key={index} {...proposal} rounded={index === 0} />
        ))}
      </div>
    </div>
  )
}

export default Proposals

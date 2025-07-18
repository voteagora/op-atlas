import { ProposalBadgeType } from "@/components/proposals/proposalsPage/components/ProposalCard"
import { ProposalRow } from "./ProposalRow"

export interface StandardProposalProps {
  rounded?: boolean
  voted?: boolean
  passed?: boolean
  badge: {
    badgeType: ProposalBadgeType
  }
  textContent: {
    title: string
    subtitle?: string
  }
  dates: {
    startDate: string
    endDate: string
  }
  arrow: {
    href: string
  }
}
interface StandardProposalsProps {
  proposals: StandardProposalProps[]
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
          <ProposalRow key={index} rounded={index === 0} {...proposal} />
        ))}
      </div>
    </div>
  )
}

export default Proposals

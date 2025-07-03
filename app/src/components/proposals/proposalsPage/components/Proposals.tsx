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
  heading?: string
}
const Proposals = ({ heading, proposals }: StandardProposalsProps) => {
  return (
    <div className="flex flex-col">
      <div>{heading && <h4 className="w-full mb-4 text-h4">{heading}</h4>}</div>
      <div>
        {proposals.map((proposal, index) => (
          <ProposalRow key={index} rounded={index === 0} {...proposal} />
        ))}
      </div>
    </div>
  )
}

export default Proposals

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
  subheading?: string
}
const Proposals = ({
  heading,
  subheading,
  proposals,
}: StandardProposalsProps) => {
  return (
    <div className="flex flex-col">
      <div>
        {heading && (
          <h4 className="w-full mb-4 text-h4 h-7 leading-[0px] tracking-[0%] align-middle">
            {heading}
          </h4>
        )}
        {subheading && (
          <p className="w-full h-[24px] font-normal text-base leading-[0px] tracking-[0%]">
            {subheading}
          </p>
        )}
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

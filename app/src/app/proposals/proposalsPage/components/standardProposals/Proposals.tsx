import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalDates,
  ProposalTextContent,
} from "@/app/proposals/proposalsPage/components/ProposalCard"

interface StandardProposalProps {
  rounded?: boolean
  badge: {
    text: string
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
const Proposal = (props: StandardProposalProps) => {
  return (
    <ProposalCard rounded={props.rounded || false}>
      <ProposalBadge text={props.badge.text} type={props.badge.badgeType} />
      <ProposalTextContent
        title={props.textContent.title}
        subtitle={props.textContent.subtitle}
      />
      <ProposalDates
        startDate={props.dates.startDate}
        endDate={props.dates.endDate}
      />
      <ProposalArrow href={props.arrow.href} />
    </ProposalCard>
  )
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
    <div className="flex flex-col" style={{ maxWidth: "1000px" }}>
      <div>
        {heading && (
          <h4 className="mb-4 text-h4 h-7 leading-[0px] tracking-[0%] align-middle">
            {heading}
          </h4>
        )}
        {subheading && (
          <p className="w-[617px] h-[24px] font-normal text-base leading-[0px] tracking-[0%]">
            {subheading}
          </p>
        )}
      </div>
      <div>
        {proposals.map((proposal, index) => (
          <Proposal key={index} rounded={index === 0} {...proposal} />
        ))}
      </div>
    </div>
  )
}

export default Proposals

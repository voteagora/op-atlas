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
    subtitle: string
  }
  dates: {
    startDate: string
    endDate: string
  }
  arrow: {
    href: string
  }
}
const StandardProposal = (props: StandardProposalProps) => {
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
}
const StandardProposals = ({ proposals }: StandardProposalsProps) => {
  return (
    <div className="flex flex-col" style={{ maxWidth: "1000px" }}>
      <div>
        <h2 className="mb-4">Proposals</h2>
      </div>
      <div>
        {proposals.map((proposal, index) => (
          <StandardProposal key={index} rounded={index === 0} {...proposal} />
        ))}
      </div>
    </div>
  )
}

export default StandardProposals

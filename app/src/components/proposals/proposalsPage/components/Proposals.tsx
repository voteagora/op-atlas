import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalDates,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"

interface StandardProposalProps {
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
const ProposalRow = (props: StandardProposalProps) => {
  const voteStatus = () => {
    if (props.badge.badgeType === ProposalBadgeType.now) {
      if (props.voted) {
        return {
          text: "You voted",
          styling: "text-success-foreground",
        }
      }
      return {
        text: "You haven't voted yet",
        styling: "text-primary",
      }
    } else if (props.badge.badgeType === ProposalBadgeType.past) {
      if (props.passed) {
        return {
          text: "Result Positive ie: Passed",
          styling: "text-success-foreground",
        }
      }
      return {
        text: "Result Negative ie: Failed",
        styling: "text-primary",
      }
    }
    return undefined
  }

  return (
    <ProposalCard rounded={props.rounded || false}>
      <ProposalBadge type={props.badge.badgeType} />
      <ProposalTextContent
        title={props.textContent.title}
        subtitle={props.textContent.subtitle}
      />
      <div className="hidden md:block">
        <ProposalDates
          startDate={props.dates.startDate}
          endDate={props.dates.endDate}
          voteStatus={voteStatus()}
        />
      </div>
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

type ProposalCardProps = {
  children: React.ReactNode
  rounded?: boolean
}

const ProposalCard = ({ children, rounded = false }: ProposalCardProps) => {
  return (
    <div
      className={`proposal-card-container border border-border ${
        rounded
          ? "border border-border rounded-t-lg"
          : "border-l border-r border-b border-border"
      }`}
    >
      <div className="proposal-card-content flex flex-row gap-6 w-full min-w-[66.5rem] flex-shrink justify-between items-center p-6">
        {children}
      </div>
    </div>
  )
}

export enum ProposalBadgeType {
  soon = "soon",
  now = "now",
  past = "past",
}

interface ProposalBadgeProps {
  type: ProposalBadgeType
}
const ProposalBadge = ({ type }: ProposalBadgeProps) => {
  const badgeClasses = (() => {
    switch (type) {
      case ProposalBadgeType.now:
        return "bg-primary text-bg/default"
      case ProposalBadgeType.past:
        return "bg-secondary text-secondary-foreground"
      case ProposalBadgeType.soon:
        return "bg-callout text-callout-foreground"
      default:
        return "bg-gray-200 text-gray-800" // Default styling
    }
  })()

  return (
    <div
      className={`status-badge w-[46px] h-[24px] px-2 py-1 rounded-full flex gap-1 ${badgeClasses}`}
    >
      <div
        className={
          "w-[30px] h-[16px] text-xs font-medium leading-none text-center rounded-full flex items-center justify-center"
        }
      >
        {type.toString()}
      </div>
    </div>
  )
}

interface ProposalTextProps {
  title: string
  subtitle?: string
}
const ProposalTextContent = ({ title, subtitle }: ProposalTextProps) => {
  return (
    <div className="flex flex-col justify-center w-full max-w-[42.1875rem] h-[48px] flex-shrink min-w-0">
      <div className="text-base font-[500] text-text/default leading-normal truncate">
        {title}
      </div>
      <div className="text-base font-normal text-text/secondary leading-normal truncate">
        {subtitle}
      </div>
    </div>
  )
}

interface ProposalDatesProps {
  startDate: string
  endDate: string
  voteStatus?: {
    text: string
    styling: string
  }
}
const ProposalDates = ({
  startDate,
  endDate,
  voteStatus,
}: ProposalDatesProps) => {
  return (
    <div className="flex flex-col w-[187px] justify-end">
      {voteStatus && (
        <div
          className={`text-base font-normal whitespace-nowrap overflow-hidden text-right sm:text-sm ${voteStatus.styling}`}
        >
          {voteStatus.text}
        </div>
      )}

      <div className="text-base font-normal text-text/secondary whitespace-nowrap overflow-hidden text-right sm:text-sm">
        {startDate} - {endDate}
      </div>
    </div>
  )
}

interface ProposalArrowProps {
  href: string
}
const ProposalArrow = ({ href }: ProposalArrowProps) => {
  return (
    <a href={href} className="block w-[36px] h-[36px] ">
      <div className="w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] gap-[8px] bg-secondary hover:bg-primary text-text/default hover:text-secondary">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5L16 12L9 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  )
}

export { ProposalArrow, ProposalBadge, ProposalDates, ProposalTextContent }
export default ProposalCard

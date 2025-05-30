type ProposalCardProps = {
  children: React.ReactNode
  rounded?: boolean
}

const ProposalCard = ({ children, rounded = false }: ProposalCardProps) => {
  return (
    <div
      className={`proposal-card-container p-6 border-b border-border ${
        rounded ? "" : "rounded-t-lg"
      }`}
    >
      <div className="proposal-card-content flex flex-row">{children}</div>
    </div>
  )
}

export enum ProposalBadgeType {
  callout = "callout",
  info = "info",
}

interface ProposalBadgeProps {
  text: string
  type: ProposalBadgeType
}
const ProposalBadge = ({ text, type }: ProposalBadgeProps) => {
  return (
    <div className="proposal-badge m-5 ">
      <div className="p-4 rounded-9999">{text}</div>
    </div>
  )
}

interface ProposalTextProps {
  title: string
  subtitle: string
}
const ProposalTextContent = ({ title, subtitle }: ProposalTextProps) => {
  return (
    <div>
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  )
}

interface ProposalDatesProps {
  startDate: string
  endDate: string
}
const ProposalDates = ({ startDate, endDate }: ProposalDatesProps) => {
  return (
    <div>
      {startDate} - {endDate}
    </div>
  )
}

interface ProposalArrowProps {
  href: string
}
const ProposalArrow = ({ href }: ProposalArrowProps) => {
  return (
    <a href={href}>
      <div>
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

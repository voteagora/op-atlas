type ProposalCardProps = {
  children: React.ReactNode
  rounded?: boolean
}

const ProposalCard = ({ children, rounded = false }: ProposalCardProps) => {
  return (
    <div
      className={`proposal-card-container p-6 border border-border ${
        rounded ? "" : "rounded-t-lg"
      }`}
    >
      <div className="proposal-card-content flex flex-row gap-2 justify-between items-center">
        {children}
      </div>
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
  const badgeClasses =
    type === ProposalBadgeType.callout ? "bg-[#D6E4FF] text-[#0E4CAF]" : ""

  return (
    <div
      className={`status-badge w-[46px] h-[24px] px-2 py-1 rounded-full flex gap-1 ${badgeClasses}`}
    >
      <div
        className={
          "w-[30px] h-[16px] text-xs font-medium leading-none text-center rounded-full flex items-center justify-center"
        }
      >
        {text}
      </div>
    </div>
  )
}

interface ProposalTextProps {
  title: string
  subtitle: string
}
const ProposalTextContent = ({ title, subtitle }: ProposalTextProps) => {
  return (
    <div className="flex flex-col justify-center w-[42.1875rem] h-[48px] rounded-md">
      <div className="text-base font-[500] text-[#0F111A] leading-normal">
        {title}
      </div>
      <div className="text-base font-normal text-[#404454] leading-normal">
        {subtitle}
      </div>
    </div>
  )
}

interface ProposalDatesProps {
  startDate: string
  endDate: string
}
const ProposalDates = ({ startDate, endDate }: ProposalDatesProps) => {
  return (
    <div className="w-[187px] h-[24px] text-base font-normal tracking-[0%] leading-[0px] text-[#404454]">
      {startDate} - {endDate}
    </div>
  )
}

interface ProposalArrowProps {
  href: string
}
const ProposalArrow = ({ href }: ProposalArrowProps) => {
  return (
    <a href={href} className="block w-[36px] h-[36px]">
      <div className="w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] gap-[8px] bg-[#F2F3F8]">
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

import { ChevronRight } from "lucide-react"
import React from "react"

type ProposalCardProps = {
  children: React.ReactNode
  rounded?: boolean
}

const ProposalCard = ({ children, rounded = false }: ProposalCardProps) => {
  return (
    <div
      className={`proposal-card-container border-border" ${
        rounded
          ? "border border-border rounded-t-lg"
          : "border-l border-r border-b border-border"
      }`}
    >
      <div className="proposal-card-content flex flex-row md:gap-6 gap-4 w-full max-w-[66.5rem] flex-shrink justify-between items-center md:p-6 p-4">
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
        return "bg-[#FF0420] text-[#FBFCFE]"
      case ProposalBadgeType.past:
        return "bg-[#F2F3F8] text-[#404454]"
      case ProposalBadgeType.soon:
        return "bg-[#D6E4FF] text-[#0E4CAF]"
      default:
        return "bg-[#F2F3F8] text-[#404454]" // Default styling
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
    <div className="flex flex-col justify-center w-full lg:min-w-[42.1875rem] h-[48px] flex-shrink min-w-0 max-w-72">
      <div className="text-base md:font-[500] sm:font-300 text-text/default leading-normal truncate">
        {title}
      </div>
      <div className="text-base md:font-normal sm:font-200 text-text/secondary leading-normal truncate">
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
    <div className="flex flex-col min-w-[187px] justify-end">
      {voteStatus && (
        <div
          className={`text-base font-normal whitespace-nowrap overflow-hidden text-right sm:text-sm ${voteStatus.styling}`}
        >
          {voteStatus.text}
        </div>
      )}

      <div className="h-[24px] font-inter font-normal text-[16px] leading-[24px] tracking-[0%] text-secondary-foreground whitespace-nowrap overflow-hidden text-right">
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
    <a href={href} className="block w-[36px] h-[36px]">
      <div className="w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] bg-secondary hover:bg-primary text-text/default hover:text-secondary">
        <ChevronRight width={14} height={14} />
      </div>
    </a>
  )
}

export { ProposalArrow, ProposalBadge, ProposalDates, ProposalTextContent }
export default ProposalCard

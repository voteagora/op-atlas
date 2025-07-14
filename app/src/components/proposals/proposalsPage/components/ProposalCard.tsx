import {
  CheckCircle,
  ChevronRight,
  Circle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react"
import React from "react"

type ProposalCardProps = {
  children: React.ReactNode
  rounded?: boolean
  href?: string
}

const ProposalCard = ({
  children,
  rounded = false,
  href,
}: ProposalCardProps) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href
    }
  }

  return (
    <button
      type="button"
      className={`border-border group cursor-pointer w-full text-left bg-transparent p-0 ${
        rounded
          ? "border border-border rounded-t-lg"
          : "border-l border-r border-b border-border"
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-row gap-4 justify-between items-center p-4">
        {children}
      </div>
    </button>
  )
}

export enum ProposalBadgeType {
  soon = "soon",
  now = "now",
  past = "past",
  closed = "closed",
}

export enum ProposalStatusBadgeType {
  ACTIVE = "ACTIVE",
  EXECUTED = "EXECUTED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  QUEUED = "QUEUED",
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
        {type.toString().charAt(0).toUpperCase() + type.toString().slice(1)}
      </div>
    </div>
  )
}

interface ProposalStatusBadgeProps {
  type: ProposalStatusBadgeType
}
const ProposalStatusBadge = ({ type }: ProposalStatusBadgeProps) => {
  const badgeConfig = (() => {
    switch (type) {
      case ProposalStatusBadgeType.ACTIVE:
        return {
          classes: "bg-green-100 text-green-800",
          icon: <Circle width={12} height={12} fill="currentColor" />,
          text: "Active",
        }
      case ProposalStatusBadgeType.EXECUTED:
        return {
          classes: "bg-green-100 text-green-800",
          icon: <CheckCircle width={12} height={12} />,
          text: "Executed",
        }
      case ProposalStatusBadgeType.PENDING:
        return {
          classes: "bg-gray-100 text-gray-600",
          icon: <Clock width={12} height={12} />,
          text: "Pending",
        }
      case ProposalStatusBadgeType.QUEUED:
        return {
          classes: "bg-gray-100 text-gray-600",
          icon: <Loader2 width={12} height={12} />,
          text: "Queued",
        }
      case ProposalStatusBadgeType.CANCELLED:
        return {
          classes: "bg-rose-200 text-rose-800",
          icon: <Circle width={12} height={12} fill="currentColor" />,
          text: "Cancelled",
        }
      case ProposalStatusBadgeType.FAILED:
        return {
          classes: "bg-rose-200 text-rose-800",
          icon: <XCircle width={12} height={12} />,
          text: "Failed",
        }
      default:
        return {
          classes: "bg-gray-100 text-gray-600",
          icon: <Clock width={12} height={12} />,
          text: "Unknown",
        }
    }
  })()

  return (
    <div
      className={`status-badge h-[24px] px-2 py-1 rounded-full flex items-center justify-center gap-1 ${badgeConfig.classes}`}
    >
      {badgeConfig.icon}
      <div className="text-xs font-medium leading-none">{badgeConfig.text}</div>
    </div>
  )
}

interface ProposalTextProps {
  title: string
  subtitle?: string
}
const ProposalTextContent = ({ title, subtitle }: ProposalTextProps) => {
  return (
    <div className="flex flex-col justify-center w-full lg:min-w-[41rem] h-[48px] flex-shrink min-w-0 max-w-72">
      <div className="text-base md:font-[500] sm:font-300 text-text/default leading-normal truncate group-hover:underline group-hover:underline-offset-4">
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
  } | null
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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <a href={href} className="block w-[36px] h-[36px]" onClick={handleClick}>
      <div className="w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] bg-secondary hover:bg-[#FF0420] group-hover:bg-[#FF0420] text-text/default hover:text-[#FBFCFE] group-hover:text-[#FBFCFE]">
        <ChevronRight width={14} height={14} />
      </div>
    </a>
  )
}

export {
  ProposalArrow,
  ProposalBadge,
  ProposalDates,
  ProposalStatusBadge,
  ProposalTextContent,
}
export default ProposalCard

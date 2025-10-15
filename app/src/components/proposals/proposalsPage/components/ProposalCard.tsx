import {
  CheckCircle,
  ChevronRight,
  Circle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import React from "react"

import { ProposalStatus } from "@/components/proposals/proposal.types"
import { cn } from "@/lib/utils"

type ProposalCardProps = {
  children: React.ReactNode
  href?: string
}

const ProposalCard = ({
  children,
  href,
}: ProposalCardProps) => {
  const cardContent = (
    <div className="flex flex-row gap-6 justify-between items-center pt-6 pr-6 pb-6 pl-4 md:p-6">
      {children}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "border-border group cursor-pointer w-full text-left bg-transparent block border-l border-r border-b first:rounded-t-lg first:border-t last:rounded-b-lg",
        )}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "border-border w-full text-left bg-transparent border-l border-r border-b first:rounded-t-lg first:border-t last:rounded-b-lg",
      )}
    >
      {cardContent}
    </div>
  )
}

export enum ProposalBadgeType {
  soon = "soon",
  now = "now",
  past = "past",
  closed = "closed",
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
          "w-[30px] h-[16px] text-xs font-normal leading-none text-center rounded-full flex items-center justify-center"
        }
      >
        {type.toString().charAt(0).toUpperCase() + type.toString().slice(1)}
      </div>
    </div>
  )
}

interface ProposalStatusBadgeProps {
  type: ProposalStatus
}
const ProposalStatusBadge = ({ type }: ProposalStatusBadgeProps) => {
  const badgeConfig = (() => {
    switch (type) {
      case ProposalStatus.ACTIVE:
        return {
          classes: "bg-green-100 text-green-800",
          icon: <Circle width={12} height={12} fill="currentColor" />,
          text: "Active",
        }
      case ProposalStatus.EXECUTED:
        return {
          classes: "bg-green-100 text-green-800",
          icon: <CheckCircle width={12} height={12} />,
          text: "Executed",
        }
      case ProposalStatus.PENDING:
        return {
          classes: "bg-gray-100 text-gray-600",
          icon: <Clock width={12} height={12} />,
          text: "Pending",
        }
      case ProposalStatus.QUEUED:
        return {
          classes: "bg-gray-100 text-gray-600",
          icon: <Loader2 width={12} height={12} />,
          text: "Queued",
        }
      case ProposalStatus.CANCELLED:
        return {
          classes: "bg-rose-200 text-rose-800",
          icon: <Circle width={12} height={12} fill="currentColor" />,
          text: "Cancelled",
        }
      case ProposalStatus.FAILED:
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
      <div className="text-xs font-normal leading-none">{badgeConfig.text}</div>
    </div>
  )
}

interface ProposalTextProps {
  title: string
  subtitle?: string
  startDate?: string
  endDate?: string
}
const ProposalTextContent = ({
  title,
  subtitle,
  startDate,
  endDate,
}: ProposalTextProps) => {
  return (
    <div className="flex flex-col justify-center w-full lg:min-w-[41rem] h-[48px] flex-shrink min-w-0 gap-0">
      <div className="text-base md:font-[500] sm:font-300 text-text/default leading-normal truncate group-hover:underline group-hover:underline-offset-4 text-[16px] text-text-default">
        {title}
      </div>
      <p className="text-base md:font-normal sm:font-200 text-text-secondary leading-6 text-[16px] truncate">
        <span className="md:hidden">
          {startDate && endDate ? `${startDate} - ${endDate}` : subtitle}
        </span>
        <span className="hidden md:inline">{subtitle}</span>
      </p>
    </div>
  )
}

interface ProposalDatesProps {
  startDate: string
  endDate: string
  voted?: boolean
  badgeType?: ProposalBadgeType
  passed?: boolean
}
const ProposalDates = ({
  startDate,
  endDate,
  voted,
  badgeType,
  passed,
}: ProposalDatesProps) => {
  const { data: session } = useSession()

  const voteText = () => {
    if (!session?.user?.id) {
      return null
    }
    if (badgeType === ProposalBadgeType.now) {
      if (voted) {
        return "You voted"
      }
      return "You haven't voted yet"
    } else if (badgeType === ProposalBadgeType.past) {
      if (passed) {
        return "Result Positive ie: Passed"
      }
      return "Result Negative ie: Failed"
    }
    return null
  }

  return (
    <div className="flex flex-col min-w-[187px] justify-end">
      <div
        className={cn(
          "text-base font-normal whitespace-nowrap overflow-hidden text-right sm:text-sm",
          {
            "text-success-foreground":
              (badgeType === ProposalBadgeType.now && voted) || passed,
            "text-destructive":
              (badgeType === ProposalBadgeType.now && !voted) ||
              (badgeType === ProposalBadgeType.past && !passed),
          },
        )}
      >
        {voteText()}
      </div>

      <p className="font-normal text-[16px] leading-[24px] tracking-[0%] text-secondary-foreground whitespace-nowrap overflow-hidden text-right">
        {startDate} - {endDate}
      </p>
    </div>
  )
}

interface ProposalArrowProps {
  href: string
  proposalType?: "STANDARD" | "SELF_NOMINATION"
}
const ProposalArrow = ({ href, proposalType }: ProposalArrowProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <a
      href={href}
      className="hidden md:block w-[36px] h-[36px]"
      onClick={handleClick}
    >
      <div
        className={cn(
          "w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] bg-secondary text-text/default",
          {
            "hover:bg-[#FF0420] group-hover:bg-[#FF0420] hover:text-[#FBFCFE] group-hover:text-[#FBFCFE]":
              proposalType === "SELF_NOMINATION",
            "hover:bg-tertiary group-hover:bg-tertiary hover:text-text-default group-hover:text-text-default":
              proposalType !== "SELF_NOMINATION",
          },
        )}
      >
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

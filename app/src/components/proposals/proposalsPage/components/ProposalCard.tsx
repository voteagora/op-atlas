import {
  CheckCircle,
  ChevronRight,
  Circle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"
import React from "react"

import { cn } from "@/lib/utils"
import { ProposalData } from "@/lib/proposals"
import { ProposalType } from "@/components/proposals/proposal.types"

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
      className={cn(
        "border-border group cursor-pointer w-full text-left bg-transparent p-0",
        {
          "border border-border rounded-t-lg": rounded,
          "border-l border-r border-b border-border": !rounded,
        },
      )}
      onClick={handleClick}
    >
      <div className="flex flex-row gap-6 justify-between items-center p-6">
        {children}
      </div>
    </button>
  )
}

export enum ProposalBadgeType {
  soon = "soon",
  now = "now",
  past = "past",
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
    <div className="flex flex-col justify-center w-full lg:min-w-[41rem] h-[48px] flex-shrink min-w-0 gap-0">
      <div className="text-base md:font-[500] sm:font-300 text-text/default leading-normal truncate group-hover:underline group-hover:underline-offset-4 text-[16px] text-text-default">
        {title}
      </div>
      <p className="text-base md:font-normal sm:font-200 text-text-secondary leading-6 text-[16px] truncate">
        {subtitle}
      </p>
    </div>
  )
}

interface ProposalMetaDataProps {
  startDate: string
  endDate: string
  voted?: boolean
  badgeType?: ProposalBadgeType
  passed?: boolean
  proposalResults?: object
  proposalType?: ProposalType
}

const ProposalDates = ({ startDate, endDate }: ProposalMetaDataProps) => (
  <p className="font-normal text-[16px] leading-[24px] tracking-[0%] text-secondary-foreground whitespace-nowrap overflow-hidden text-right">
    {startDate} - {endDate}
  </p>
)

const ProposalStatusText = ({
  voted,
  badgeType,
  passed,
  proposalResults,
  proposalType,
}: ProposalMetaDataProps) => {
  const { data: session } = useSession()

  const getNumApprovals = ({
    proposalResults,
  }: {
    proposalResults?: object
  }): [number, number] => {
    // Ensure proposalResults exists and options is an array
    const options =
      proposalResults && Array.isArray((proposalResults as any).options)
        ? (proposalResults as any).options
        : null

    if (!options) return [0, 0]

    const total = options.length
    const approved = options.filter(
      (option: any) => !!option && option.isApproved === true,
    ).length

    return [total, approved]
  }

  const [totalOptions, passedOptions] = getNumApprovals({ proposalResults })

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
      console.log({ proposalType, proposalResults })
      // special check for approval voting
      if (proposalType && proposalType.includes("APPROVAL")) {
        if (proposalResults && passed) {
          return `${passedOptions} of ${totalOptions} approved`
        }
      }
      if (passed) {
        return "Result Positive ie: Passed"
      }
      return "Result Negative ie: Failed"
    }
    return null
  }

  const proposalSuccessful = () => {
    if (badgeType === ProposalBadgeType.now) {
      return voted
    }
    if (badgeType === ProposalBadgeType.past) {
      if (proposalType?.includes("APPROVAL")) {
        return passedOptions > 0 && passed
      }
      return passed
    }
    return false
  }

  return (
    <div
      className={cn(
        "text-base font-normal whitespace-nowrap overflow-hidden text-right sm:text-sm",
        {
          "text-success-foreground": proposalSuccessful(),
          "text-destructive": !proposalSuccessful(),
        },
      )}
    >
      {voteText()}
    </div>
  )
}
const ProposalMetaData = ({
  startDate,
  endDate,
  voted,
  badgeType,
  passed,
  proposalResults,
  proposalType,
}: ProposalMetaDataProps) => {
  return (
    <div className="flex flex-col min-w-[187px] justify-end">
      <ProposalStatusText
        voted={voted}
        badgeType={badgeType}
        passed={passed}
        startDate={startDate}
        endDate={endDate}
        proposalType={proposalType}
        proposalResults={proposalResults}
      />
      <ProposalDates startDate={startDate} endDate={endDate} />
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
    <a href={href} className="block w-[36px] h-[36px]" onClick={handleClick}>
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
  ProposalMetaData,
  ProposalStatusBadge,
  ProposalTextContent,
}
export default ProposalCard

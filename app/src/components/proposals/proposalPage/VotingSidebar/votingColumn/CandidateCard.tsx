"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { UserAvatar } from "@/components/common/UserAvatar"
import { cn } from "@/lib/utils"

type SimplifiedUserOrOrg = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

const CandidateCard = ({
  candidate,
  selectedVote,
  setSelectedVote,
  votingDisabled,
}: {
  candidate: SimplifiedUserOrOrg
  selectedVote?: boolean
  setSelectedVote: () => void
  votingDisabled?: boolean
}) => {
  const [isHoveringButton, setIsHoveringButton] = useState(false)

  const handleCardClick = () => {
    const profileUrl = candidate.link.includes("http")
      ? candidate.link
      : `/${candidate.link}`
    window.open(profileUrl, "_blank")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <div
      className="group w-full h-10 p-2 rounded-[6px] cursor-pointer hover:bg-backgroundSecondary transition-colors duration-200"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center h-5 gap-[8px] justify-between">
        <div className="flex flex-row gap-2">
          <UserAvatar imageUrl={candidate?.avatar} size={"sm"} />
          <CardUsername
            username={candidate.name}
            link={candidate.link}
            isHoveringButton={isHoveringButton}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <CardApprovalButton
            selected={selectedVote}
            onClick={setSelectedVote}
            votingDisabled={votingDisabled}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          />
          <div className="pointer-events-none">
            <ChevronRight width={12} height={12} />
          </div>
        </div>
      </div>
    </div>
  )
}

const CardUsername = ({
  username,
  link,
  isHoveringButton,
}: {
  username: string
  link: string
  isHoveringButton?: boolean
}) => {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={username}
      className={cn(
        "font-normal min-w-5 max-w-[130px] text-[14px] leading-5 tracking-[0%] whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-all duration-200",
        {
          "group-hover:underline": !isHoveringButton,
          "hover:underline": isHoveringButton,
        },
      )}
    >
      {username}
    </Link>
  )
}

const CardApprovalButton = ({
  selected = false,
  onClick,
  votingDisabled,
  onMouseEnter,
  onMouseLeave,
}: {
  selected?: boolean
  onClick?: () => void
  votingDisabled?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }
  if (selected) {
    return (
      <button
        className={cn(
          "w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-success text-[#006117] border-green-400",
          {
            "cursor-default": votingDisabled,
            "cursor-pointer": !votingDisabled,
          },
        )}
        onClick={handleButtonClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={votingDisabled}
      >
        <span className="font-medium text-xs leading-4 font-inter">
          Approved
        </span>
      </button>
    )
  }

  if (votingDisabled) {
    return null
  }

  return (
    <button
      className="w-[72px] h-[28px] md:w-[65px] md:h-[24px] px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-background text-[#0F111A] border-border hover:bg-[#D6FFDA] hover:border-[#7AF088] hover:text-[#006117]"
      onClick={handleButtonClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="font-medium text-sm leading-5 md:text-xs md:leading-4 font-inter">
        Approve
      </span>
    </button>
  )
}

export default CandidateCard

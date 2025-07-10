"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"

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
  return (
    <div className="w-full h-10 p-2 rounded-[6px]">
      <div className="flex items-center h-5 gap-[8px] justify-between">
        <div className="flex flex-row gap-2">
          <UserAvatar imageUrl={candidate?.avatar} size={"xs"} />
          <CardUsername username={candidate.name} link={candidate.link} />
        </div>
        <div className="flex flex-row items-center gap-2">
          <CardApprovalButton
            selected={selectedVote}
            onClick={setSelectedVote}
            votingDisabled={votingDisabled}
          />
          <a href={candidate.link} target="_blank" rel="noopener noreferrer">
            <ChevronRight width={12} height={12} />
          </a>
        </div>
      </div>
    </div>
  )
}

const CardUsername = ({
  username,
  link,
}: {
  username: string
  link: string
}) => {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={username}
      className="font-normal min-w-5 max-w-[130px] text-[14px] leading-5 tracking-[0%] whitespace-nowrap overflow-hidden text-ellipsis hover:underline cursor-pointer"
    >
      {username}
    </Link>
  )
}

const CardApprovalButton = ({
  selected = false,
  onClick,
  votingDisabled,
}: {
  selected?: boolean
  onClick?: () => void
  votingDisabled?: boolean
}) => {
  if (selected) {
    return (
      <div
        className={cn(
          "w-[72px] h-6 px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-success",
          {
            "cursor-default": votingDisabled,
            "cursor-pointer": !votingDisabled,
          },
        )}
      >
        <button
          className="font-normal text-xs leading-5 text-success-foreground"
          onClick={onClick}
          disabled={votingDisabled}
        >
          Approved
        </button>
      </div>
    )
  }

  if (votingDisabled) {
    return null
  }

  return (
    <div
      className={
        "w-[65px] h-[24px] px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-secondary cursor-pointer"
      }
    >
      <button className="font-normal text-xs leading-5" onClick={onClick}>
        Approve
      </button>
    </div>
  )
}

export default CandidateCard

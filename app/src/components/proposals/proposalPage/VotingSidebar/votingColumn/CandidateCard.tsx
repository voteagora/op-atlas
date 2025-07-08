"use client"

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
    <div className="w-[272px] h-10 py-2 pr-[var(--dimensions-5)] pl-[var(--dimensions-5)] rounded-[6px]">
      <div className="flex items-center h-5 gap-[8px] justify-between">
        <div className="flex flex-row gap-2">
          <UserAvatar imageUrl={candidate?.avatar} size={"xs"} />
          <CardUsername username={candidate.name} link={candidate.link} />
        </div>
        <CardApprovalButton
          selected={selectedVote}
          onClick={setSelectedVote}
          votingDisabled={votingDisabled}
        />
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
      className="font-normal min-w-5 text-[14px] leading-5 tracking-[0%] whitespace-nowrap overflow-hidden text-ellipsis hover:underline cursor-pointer"
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

const CardCarrot = ({ link }: { link: string }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer"
    >
      <div className="w-[12px] h-[12px] flex items-center justify-center">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 9L7.5 6L4.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  )
}

export default CandidateCard

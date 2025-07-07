"use client"

import { User } from "@prisma/client"

import { UserAvatar } from "@/components/common/UserAvatar"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

const CandidateCard = ({
  user,
  selectedVote,
  setSelectedVote,
  votingDisabled,
}: {
  user: User
  selectedVote?: boolean
  setSelectedVote: () => void
  votingDisabled?: boolean
}) => {
  const { data: projects, isLoading } = useUserProjects(user?.id)

  console.log({ user, projects })
  return (
    <div className="w-[272px] h-10 py-2 pr-[var(--dimensions-5)] pl-[var(--dimensions-5)] rounded-[6px]">
      <div className="flex items-center h-5 gap-[8px] justify-between">
        <UserAvatar imageUrl={user?.imageUrl} size={"xs"} />
        <CardUsername username={user?.username || ""} />
        <CardOrganizations projects={projects} />
        <CardApprovalButton
          selected={selectedVote}
          onClick={setSelectedVote}
          votingDisabled={votingDisabled}
        />
        {/*<CardCarrot link={carrotLink} />*/}
      </div>
    </div>
  )
}

const CardUsername = ({ username }: { username: string }) => {
  return (
    <div className="font-normal min-w-5 text-[14px] leading-5 tracking-[0%] whitespace-nowrap overflow-hidden text-ellipsis">
      {username}
    </div>
  )
}

const CardOrganizations = ({
  projects,
}: {
  projects?: ProjectWithDetails[] | null
}) => {
  // This should give us a list of only organization string values
  const organizationNames =
    projects
      ?.map((proj) => proj?.organization?.organization?.name)
      .filter((name): name is string => Boolean(name)) ?? []

  return (
    <div className="min-w-1 max-w-32 h-5 text-[14px] leading-5 tracking-[0%] text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">
      {organizationNames.join(", ")}
    </div>
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

  return (
    <div
      className={cn(
        "w-[65px] h-[24px] px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-secondary",
        {
          "cursor-default": votingDisabled,
          "cursor-pointer": !votingDisabled,
        },
      )}
    >
      <button
        className="font-normal text-xs leading-5"
        onClick={onClick}
        disabled={votingDisabled}
      >
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

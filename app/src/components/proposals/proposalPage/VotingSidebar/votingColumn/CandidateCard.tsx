"use client"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import { Organization, User } from "@prisma/client"
import { CitizenshipQualification, ProjectWithDetails } from "@/lib/types"
import { useUserProjects } from "@/hooks/db/useUserProjects"

const CandidateCard = ({
  user,
  qualification,
  selectedVote,
  setSelectedVote,
}: {
  user: User
  qualification: CitizenshipQualification
  selectedVote?: boolean
  setSelectedVote: () => void
}) => {
  const { data: projects, isLoading } = useUserProjects(user.id)

  console.log({ projects })
  return (
    <div className="w-[272px] h-10 py-2 pr-[var(--dimensions-5)] pl-[var(--dimensions-5)] rounded-[6px]">
      <div className="flex items-center h-5 gap-[8px] justify-between">
        <EligibleCitizenAvatar
          user={user}
          qualification={qualification}
          size={"sm"}
        />
        <CardUsername username={user.username!} />
        <CardOrganizations projects={projects} />
        <CardApprovalButton selected={selectedVote} onClick={setSelectedVote} />
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
}: {
  selected?: boolean
  onClick?: () => void
}) => {
  if (selected) {
    return (
      <div className="w-[72px] h-6 px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-success cursor-pointer">
        <button
          className="font-normal text-xs leading-5 text-success-foreground"
          onClick={onClick}
        >
          Approved
        </button>
      </div>
    )
  }

  return (
    <div
      className={`w-[65px] h-[24px] px-1 py-2 gap-2 flex items-center justify-center rounded-md bg-secondary cursor-pointer`}
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

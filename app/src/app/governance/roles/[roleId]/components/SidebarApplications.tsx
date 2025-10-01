"use client"

import { Role, RoleApplication } from "@prisma/client"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { UserAvatar } from "@/components/common/UserAvatar"
import ExternalLink from "@/components/ExternalLink"
import { ArrowRightS } from "@/components/icons/remix"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import {
  useApproveNominee,
  useEndorsementCounts,
  useIsTop100,
  useMyEndorsements,
  useRemoveEndorsement,
} from "@/hooks/db/useTop100"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { formatMMMd } from "@/lib/utils/date"
import { getRolePhaseStatus } from "@/lib/utils/roles"

export default function SidebarApplications({
  role,
  applications,
  isSecurityRole,
  endorsementEndAt,
}: {
  role: Role
  applications?: RoleApplication[]
  isSecurityRole?: boolean
  endorsementEndAt: Date | null
}) {
  const { data: t100, isLoading: loadingTop } = useIsTop100()
  const { isVotingPhase, isEndorsementPhase } = getRolePhaseStatus(role)
  const withinWindow = isEndorsementPhase
  const { data: counts } = useEndorsementCounts(role.id, `role-${role.id}`, {
    enabled: isEndorsementPhase,
  })

  const isTop100 = Boolean(t100?.top100)

  if ((!applications || applications.length === 0) && !isSecurityRole) {
    return null
  }

  const renderHeader = () => {
    if (isSecurityRole) {
      let primaryText =
        "8 approvals from Top 100 Delegates are required to move on to the vote"
      let secondaryText = `Top 100 Delegates may provide approval ${
        endorsementEndAt ? "until " + formatMMMd(endorsementEndAt) : ""
      }.`

      if (isVotingPhase) {
        primaryText = "This vote is for delegates only"
        secondaryText = "Delegates can cast their vote at Optimism Agora."
      }

      return (
        <div className="text-center p-6 border-b border-border-secondary">
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-secondary-foreground">
              {primaryText}
            </div>
            <div className="text-sm text-secondary-foreground">
              {secondaryText}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="text-secondary-foreground text-sm font-semibold p-6">
        {applications?.length ?? 0} candidate
        {(applications?.length ?? 0) > 1 ? "s" : ""} so far
      </div>
    )
  }

  const renderFooter = () => {
    if (isSecurityRole && role.proposalId && isVotingPhase) {
      return (
        <div className="mx-4 mb-6">
          <Button
            className="w-full"
            onClick={() =>
              window.open(
                `${process.env.NEXT_PUBLIC_AGORA_API_URL}proposals/${role.proposalId}`,
                "_blank",
              )
            }
          >
            Vote on Agora
          </Button>
        </div>
      )
    }
  }

  return (
    <>
      <div className="w-full flex flex-col border border-border-secondary rounded-lg">
        {renderHeader()}
        {applications && applications.length > 0 ? (
          <div className="flex flex-col p-6">
            <div className="text-secondary-foreground text-sm font-semibold mb-2">
              {applications.length} candidate
              {applications.length > 1 ? "s" : ""}
            </div>
            {applications?.map((application) =>
              application.userId ? (
                <UserCandidate
                  key={application.id}
                  application={application}
                  showApprove={!loadingTop && isTop100 && withinWindow}
                  roleId={role.id}
                  count={
                    isEndorsementPhase
                      ? counts?.find(
                          (c) => c.nomineeApplicationId === application.id,
                        )?.count || 0
                      : false
                  }
                />
              ) : (
                <OrgCandidate
                  key={application.id}
                  application={application}
                  showApprove={!loadingTop && isTop100 && withinWindow}
                  roleId={role.id}
                  count={
                    isEndorsementPhase
                      ? counts?.find(
                          (c) => c.nomineeApplicationId === application.id,
                        )?.count || 0
                      : false
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="text-center p-6 border-border-secondary text-sm font-medium">
            No candidates yet
          </div>
        )}
        {renderFooter()}
      </div>
      <div className="text-center text-sm text-secondary-foreground">
        <span className="font-medium">Need help? </span>
        <ExternalLink href="https://discord.gg/fDWeZUNX" className="underline">
          Ask on Discord
        </ExternalLink>
      </div>
    </>
  )
}

const OrgCandidate = ({
  application,
  showApprove,
  roleId,
  count,
}: {
  application: RoleApplication
  showApprove: boolean
  roleId: number
  count: number | boolean
}) => {
  const { data: org } = useOrganization({ id: application.organizationId! })
  const approve = useApproveNominee()
  const remove = useRemoveEndorsement()
  const { data: orgEndorsements } = useMyEndorsements(roleId, `role-${roleId}`)
  const isEndorsed = Boolean(
    orgEndorsements?.endorsedIds?.includes(application.id),
  )

  if (!org) {
    return <CandidateSkeleton />
  }

  const handleClick = () => window.open(`/${org.id}`, "_blank")
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    void toast.promise(
      approve.mutateAsync({
        context: `role-${roleId}`,
        nomineeApplicationId: application.id,
      }),
      {
        loading: "Approving...",
        success: "Approved",
        error: (err) =>
          err instanceof Error ? err.message : "Failed to approve",
      },
    )
  }

  return (
    <div
      className="flex flex-row w-full justify-between cursor-pointer py-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${org.name}`}
    >
      <div className="flex flex-row gap-2 text-sm items-center min-w-0">
        <UserAvatar imageUrl={org.avatarUrl} size={"20px"} />
        <span className="truncate whitespace-nowrap">{org.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== false && (
          <div className="text-xs px-1 rounded text-center text-secondary-foreground font-medium bg-[#f2f3f8]">
            {count}
          </div>
        )}
        {showApprove && !isEndorsed && (
          <button
            className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-background text-[#0F111A] border-border hover:bg-[#D6FFDA] hover:border-[#7AF088] hover:text-[#006117] font-medium"
            onClick={onApprove}
            disabled={approve.isPending}
          >
            <span className="font-medium text-xs leading-4">Approve</span>
          </button>
        )}
        {showApprove && isEndorsed && (
          <button
            className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-success text-[#006117] border-green-400 font-medium"
            onClick={(e) => {
              e.stopPropagation()
              void toast.promise(
                remove.mutateAsync({
                  context: `role-${roleId}`,
                  nomineeApplicationId: application.id,
                }),
                {
                  loading: "Removing approval...",
                  success: "Approval removed",
                  error: (err) =>
                    err instanceof Error
                      ? err.message
                      : "Failed to remove approval",
                },
              )
            }}
            disabled={remove.isPending}
          >
            <span className="font-medium text-xs leading-4">Approved</span>
          </button>
        )}
        <ArrowRightS className="w-4 h-4" />
      </div>
    </div>
  )
}

const UserCandidate = ({
  application,
  showApprove,
  roleId,
  count,
}: {
  application: RoleApplication
  showApprove: boolean
  roleId: number
  count: number | boolean
}) => {
  const { user } = useUser({ id: application.userId! })
  const username = useUsername(user)
  const approve = useApproveNominee()
  const remove = useRemoveEndorsement()
  // derive endorsed state from aggregated hook
  const { data: userEndorsements } = useMyEndorsements(roleId, `role-${roleId}`)
  const isEndorsed = Boolean(
    userEndorsements?.endorsedIds?.includes(application.id),
  )

  if (!user) {
    return <CandidateSkeleton />
  }

  const handleClick = () => window.open(`/${user.username}`, "_blank")
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    void toast.promise(
      approve.mutateAsync({
        context: `role-${roleId}`,
        nomineeApplicationId: application.id,
      }),
      {
        loading: "Approving...",
        success: "Approved",
        error: (err) =>
          err instanceof Error ? err.message : "Failed to approve",
      },
    )
  }

  return (
    <div
      className="flex flex-row gap-2 w-full justify-between cursor-pointer py-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${username || user.name}`}
    >
      <div className="flex flex-row gap-2 text-sm items-center min-w-0">
        <UserAvatar imageUrl={user.imageUrl} size={"20px"} />
        <span className="truncate whitespace-nowrap">
          {username || user.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {count !== false && (
          <div className="text-xs px-1 rounded text-center text-secondary-foreground font-medium bg-[#f2f3f8]">
            {count}
          </div>
        )}
        {showApprove && !isEndorsed && (
          <button
            className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-background text-[#0F111A] border-border hover:bg-[#D6FFDA] hover:border-[#7AF088] hover:text-[#006117] font-medium"
            onClick={onApprove}
            disabled={approve.isPending}
          >
            <span className="font-medium text-xs leading-4">Approve</span>
          </button>
        )}
        {showApprove && isEndorsed && (
          <button
            className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-success text-[#006117] border-green-400 font-medium"
            onClick={(e) => {
              e.stopPropagation()
              void toast.promise(
                remove.mutateAsync({
                  context: `role-${roleId}`,
                  nomineeApplicationId: application.id,
                }),
                {
                  loading: "Removing approval...",
                  success: "Approval removed",
                  error: (err) =>
                    err instanceof Error
                      ? err.message
                      : "Failed to remove approval",
                },
              )
            }}
            disabled={remove.isPending}
          >
            <span className="font-medium text-xs leading-4">Approved</span>
          </button>
        )}
        <ArrowRightS className="w-4 h-4" />
      </div>
    </div>
  )
}

const CandidateSkeleton = () => {
  return (
    <div className="flex flex-row w-full items-center gap-3 py-3">
      <Skeleton className="w-[20px] h-[20px] rounded-full" />
      <Skeleton className="h-4 flex-1" />
    </div>
  )
}

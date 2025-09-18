"use client"

import { RoleApplication } from "@prisma/client"
import { useMemo } from "react"

import { Button } from "@/components/common/Button"
import { UserAvatar } from "@/components/common/UserAvatar"
import ExternalLink from "@/components/ExternalLink"
import { ArrowRightS } from "@/components/icons/remix"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { formatMMMd } from "@/lib/utils/date"
import { useIsTop100, useApproveNominee, useEndorsementEligibility } from "@/hooks/db/useTop100"

export default function SidebarApplications({
  roleId,
  applications,
  isSecurityRole,
  endorsementEndAt,
  voteStartsAt,
  voteEndsAt,
}: {
  roleId: number
  applications?: RoleApplication[]
  isSecurityRole?: boolean
  endorsementEndAt: Date | null
  voteStartsAt: Date | null
  voteEndsAt: Date | null
}) {
  const { data: t100, isLoading: loadingTop } = useIsTop100()
  const { data: elig, isLoading: loadingElig } = useEndorsementEligibility(roleId)
  const withinWindow = useMemo(() => {
    if (elig && typeof elig.eligible === "boolean") {
      // eligibility endpoint already checked time window (and top-100). Here we only reuse window state
      // Treat eligible false with reason window_closed as outside window
      if (!elig.eligible && elig.reason === "window_closed") return false
      return true
    }
    // fallback
    const now = Date.now()
    const start = voteStartsAt ? new Date(voteStartsAt).getTime() : undefined
    const end = voteEndsAt ? new Date(voteEndsAt).getTime() : undefined
    if (start && now < start) return false
    if (end && now > end) return false
    return true
  }, [elig, voteStartsAt, voteEndsAt])

  const isTop100 = Boolean(t100?.top100)

  if ((!applications || applications.length === 0) && !isSecurityRole) {
    return null
  }
  return (
    <>
      <div className="w-full flex flex-col border border-border-secondary rounded-lg">
        {isSecurityRole ? (
          <div className="text-center p-6 border-b border-border-secondary">
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-secondary-foreground">
                8 approvals from Top 100 Delegates are required to move on to
                the vote
              </div>
              <div className="text-sm text-secondary-foreground">
                Top 100 Delegates may provide approval{" "}
                {endorsementEndAt
                  ? "until " + formatMMMd(endorsementEndAt)
                  : ""}
                .
              </div>
            </div>
          </div>
        ) : (
          <div className="text-secondary-foreground text-sm font-semibold p-6">
            {applications?.length ?? 0} candidate
            {(applications?.length ?? 0) > 1 ? "s" : ""} so far
          </div>
        )}
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
                  showApprove={!loadingTop && !loadingElig && isTop100 && withinWindow}
                  roleId={roleId}
                />
              ) : (
                <OrgCandidate
                  key={application.id}
                  application={application}
                  showApprove={!loadingTop && !loadingElig && isTop100 && withinWindow}
                  roleId={roleId}
                />
              ),
            )}
          </div>
        ) : (
          <div className="text-center p-6 border-border-secondary text-sm font-medium">
            No candidates yet
          </div>
        )}
      </div>
      <div className="text-center text-sm text-secondary-foreground">
        <span className="font-medium">Need help? </span>
        <ExternalLink href="https://discord.gg/opatlas" className="underline">
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
}: {
  application: RoleApplication
  showApprove: boolean
  roleId: number
}) => {
  const { data: org } = useOrganization({ id: application.organizationId! })
  const approve = useApproveNominee()

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
    approve.mutate({ context: `role-${roleId}`, nomineeApplicationId: application.id })
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
      <div className="flex flex-row gap-2 text-sm ">
        <UserAvatar imageUrl={org.avatarUrl} size={"20px"} />
        {org.name}
      </div>
      {showApprove ? (
        <Button className="h-6 px-2 py-1 text-xs" onClick={onApprove} disabled={approve.isPending}>
          {approve.isPending ? "Approving..." : "Approve"}
        </Button>
      ) : (
        <ArrowRightS className="w-4 h-4" />
      )}
    </div>
  )
}

const UserCandidate = ({
  application,
  showApprove,
  roleId,
}: {
  application: RoleApplication
  showApprove: boolean
  roleId: number
}) => {
  const { user } = useUser({ id: application.userId! })
  const username = useUsername(user)
  const approve = useApproveNominee()

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
    approve.mutate({ context: `role-${roleId}`, nomineeApplicationId: application.id })
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
      <div className="flex flex-row gap-2 text-sm ">
        <UserAvatar imageUrl={user.imageUrl} size={"20px"} />
        {username || user.name}
      </div>
      {showApprove ? (
        <Button className="h-6 px-2 py-1 text-xs" onClick={onApprove} disabled={approve.isPending}>
          {approve.isPending ? "Approving..." : "Approve"}
        </Button>
      ) : (
        <ArrowRightS className="w-4 h-4" />
      )}
    </div>
  )
}

const CandidateSkeleton = () => {
  return (
    <div className="flex flex-row w-full justify-between py-2">
      <div className="flex flex-row gap-3 text-sm items-center">
        <Skeleton className="w-[20px] h-[20px] rounded-full" />
        <Skeleton className="w-28 h-4" />
      </div>
    </div>
  )
}

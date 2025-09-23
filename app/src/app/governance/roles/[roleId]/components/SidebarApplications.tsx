"use client"

import { RoleApplication } from "@prisma/client"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { UserAvatar } from "@/components/common/UserAvatar"
import ExternalLink from "@/components/ExternalLink"
import { ArrowRightS } from "@/components/icons/remix"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import {
  useApproveNominee,
  useHasEndorsed,
  useRemoveEndorsement,
} from "@/hooks/db/useTop100"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { formatMMMd } from "@/lib/utils/date"

export default function SidebarApplications({
  applications,
  isSecurityRole,
  endorsementEndAt,
}: {
  applications?: RoleApplication[]
  isSecurityRole?: boolean
  endorsementEndAt: Date | null
}) {
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
                <UserCandidate key={application.id} application={application} />
              ) : (
                <OrgCandidate key={application.id} application={application} />
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

const mapErrorMessage = (fallback: string) => (err: unknown) =>
  err instanceof Error ? err.message : fallback

const OrgCandidate = ({ application }: { application: RoleApplication }) => {
  const { data: org } = useOrganization({ id: application.organizationId! })
  const approve = useApproveNominee()
  const remove = useRemoveEndorsement()
  const params = useParams<{ roleId: string }>()
  const roleId = Number(params.roleId)
  const { data: endorsed } = useHasEndorsed(application.id, `role-${roleId}`)

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
      {endorsed?.endorsed ? (
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
                error: mapErrorMessage("Failed to remove approval"),
              },
            )
          }}
          disabled={remove.isPending}
        >
          <span className="font-medium text-xs leading-4">Approved</span>
        </button>
      ) : (
        <button
          className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-background text-foreground border-border font-medium"
          onClick={(e) => {
            e.stopPropagation()
            void toast.promise(
              approve.mutateAsync({
                context: `role-${roleId}`,
                nomineeApplicationId: application.id,
              }),
              {
                loading: "Approving...",
                success: "Approved",
                error: mapErrorMessage("Failed to approve"),
              },
            )
          }}
          disabled={approve.isPending}
        >
          <span className="font-medium text-xs leading-4">Approve</span>
        </button>
      )}
    </div>
  )
}

const UserCandidate = ({ application }: { application: RoleApplication }) => {
  const { user } = useUser({ id: application.userId! })
  const username = useUsername(user)
  const approve = useApproveNominee()
  const remove = useRemoveEndorsement()
  const params = useParams<{ roleId: string }>()
  const roleId = Number(params.roleId)
  const { data: endorsed } = useHasEndorsed(application.id, `role-${roleId}`)

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
      {endorsed?.endorsed ? (
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
                error: mapErrorMessage("Failed to remove approval"),
              },
            )
          }}
          disabled={remove.isPending}
        >
          <span className="font-medium text-xs leading-4">Approved</span>
        </button>
      ) : (
        <button
          className="w-[72px] h-6 px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 bg-background text-foreground border-border font-medium"
          onClick={(e) => {
            e.stopPropagation()
            void toast.promise(
              approve.mutateAsync({
                context: `role-${roleId}`,
                nomineeApplicationId: application.id,
              }),
              {
                loading: "Approving...",
                success: "Approved",
                error: mapErrorMessage("Failed to approve"),
              },
            )
          }}
          disabled={approve.isPending}
        >
          <span className="font-medium text-xs leading-4">Approve</span>
        </button>
      )}
    </div>
  )
}

const CandidateSkeleton = () => {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="flex flex-row gap-2 text-sm">
        <Skeleton className="w-[20px] h-[20px] rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  )
}

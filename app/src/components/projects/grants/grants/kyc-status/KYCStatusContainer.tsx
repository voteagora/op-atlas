"use client"

import { KYCUser, Organization } from "@prisma/client"
import { useParams } from "next/navigation"
import { useState } from "react"
import { ReactNode, useCallback } from "react"

import ConnectedOrganizationProjects from "@/components/projects/grants/grants/kyc-status/ConnctedOrganizationProjects"
import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import { EmailState, ProjectWithKycTeam } from "@/components/projects/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"
import { sendKYCReminderEmail, sendKYBReminderEmail } from "@/lib/actions/emails"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { useAppDialogs } from "@/providers/DialogProvider"

const KYCStatusContainer = ({
  project,
  organization,
  isAdmin = true,
}: {
  project?: ProjectWithKycTeam
  organization?: Organization
  isAdmin?: boolean
}) => {
  if (!project && !organization) {
    return <div>Project or organization not found</div>
  }
  return (
    <div className="flex flex-col w-full max-w-[712px] gap-6">
      {project ? (
        <ProjectKYCStatusContainer project={project} isAdmin={isAdmin} />
      ) : (
        organization && (
          <OrganizationKYCStatusContainer
            organization={organization}
            isAdmin={isAdmin}
          />
        )
      )}
    </div>
  )
}

const KYCSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Project Status Skeleton */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-5 w-32" />
    </div>

    {/* Grant Delivery Address Skeleton */}
    <div className="flex flex-col gap-2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-full" />
    </div>

    {/* Individual Statuses Skeleton */}
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-36" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="flex justify-center items-center gap-2 mt-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
)

const KYCStatusTitle = ({ hasKYCTeamWithUsers = false }: { hasKYCTeamWithUsers?: boolean }) => {
  return (
    <div className="space-y-6">
      <h2>Grant Delivery Address</h2>
      <p className="text-secondary-foreground font-normal">
        Add the wallet address your rewards will be delivered to. Identity
        verification is required for each address.
      </p>
      {!hasKYCTeamWithUsers && (
        <p className="text-secondary-foreground font-normal">
          Get started by submitting the grant eligibility form.
        </p>
      )}
    </div>
  )
}

// Shared hook to manage resend email state/handler
const useKYCEmailResend = (context: {
  projectId?: string
  organizationId?: string
}) => {
  const [sendingEmailUsers, setSendingEmailUsers] = useState<
    Record<string, EmailState>
  >({})

  const handleEmailResend = useCallback(
    async (kycUser: KYCUser) => {
      console.log(`attempting to send email to ${kycUser.email}`)
      setSendingEmailUsers((prev) => ({
        ...prev,
        [kycUser.id]: EmailState.SENDING,
      }))
      try {
        const isKYB = kycUser.kycUserType === "LEGAL_ENTITY"
        const response = isKYB
          ? await sendKYBReminderEmail(kycUser, context)
          : await sendKYCReminderEmail(kycUser, context)
        console.log("Email resend success:", response)
      } catch (error) {
        console.error("Failed to send email:", error)
      } finally {
        setSendingEmailUsers((prev) => ({
          ...prev,
          [kycUser.id]: EmailState.SENT,
        }))
      }
    },
    [context],
  )

  return { sendingEmailUsers, handleEmailResend }
}

// Shared presenter to render common KYC status UI
const KYCStatusPresenter = ({
  status,
  address,
  users,
  isLoading,
  kycTeamId,
  extraMiddleContent,
  showEditFooter = false,
  isAdmin = true,
}: {
  status: import("@/components/projects/types").ExtendedPersonaStatus
  address: string
  users:
    | {
        user: KYCUser
        handleEmailResend: (u: KYCUser) => Promise<void>
        emailResendBlock: boolean
        emailState: EmailState
      }[]
    | undefined
  isLoading: boolean
  kycTeamId?: string
  extraMiddleContent?: ReactNode
  showEditFooter?: boolean
  isAdmin?: boolean
}) => {
  const { organizationId, projectId } = useParams()
  const { setData, setOpenDialog } = useAppDialogs()

  const openDeleteKYCTeamDialog = () => {
    setData({
      kycTeamId,
      projectId: projectId as string,
      organizationId: organizationId as string,
      hasActiveStream: false,
    })
    setOpenDialog("delete_kyc_team")
  }

  const individualStatuses = users
    ? users.filter((u) => u.user.kycUserType === "USER")
    : []
  const legalEntitiesStatuses = users
    ? users.filter((u) => u.user.kycUserType === "LEGAL_ENTITY")
    : []
  return (
    <>
      <div className="flex flex-col max-w border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        {isLoading ? (
          <KYCSkeleton />
        ) : (
          <>
            <ProjectStatus status={status} kycTeamId={kycTeamId} />
            <GrantDeliveryAddress address={address} />
            {extraMiddleContent}
            {users && users.length > 0 && (
              <>
                <IndividualStatuses
                  users={individualStatuses}
                  isAdmin={isAdmin}
                />
                {users.some((u) => u.user.kycUserType === "LEGAL_ENTITY") && (
                  <LegalEntities
                    users={legalEntitiesStatuses}
                    isAdmin={isAdmin}
                  />
                )}
              </>
            )}
            {showEditFooter && isAdmin && (
              <div className="flex flex-row w-full max-w-[664px] justify-center items-center gap-2">
                <p className="font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
                  Is something missing or incorrect?
                </p>
                <span
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      openDeleteKYCTeamDialog()
                    }
                  }}
                  onClick={openDeleteKYCTeamDialog}
                  aria-label="Start KYC process over"
                  className="cursor-pointer"
                >
                  <p className="underline font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
                    Start over
                  </p>
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

const ProjectKYCStatusContainer = ({
  project,
  isAdmin = true,
}: {
  project: ProjectWithKycTeam
  isAdmin?: boolean
}) => {
  const {
    data: kycUsers,
    isLoading,
    isError,
    error: useKYCProjectError,
  } = useKYCProject({ projectId: project.id })
  const projectStatus = kycUsers ? resolveProjectStatus(kycUsers) : "PENDING"

  const { sendingEmailUsers, handleEmailResend } = useKYCEmailResend({
    projectId: project.id,
  })

  const users = kycUsers?.map((user) => ({
    user,
    handleEmailResend,
    emailResendBlock:
      !isAdmin ||
      projectStatus === "project_issue" ||
      user.status === "APPROVED",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
  }))

  if (isError) {
    console.error(`Error loading KYC users data: ${useKYCProjectError}`)
  }

  return (
    <KYCStatusPresenter
      status={projectStatus}
      address={project.kycTeam?.walletAddress || ""}
      users={users}
      isLoading={isLoading}
      kycTeamId={project.kycTeam?.id}
      showEditFooter
      isAdmin={isAdmin}
    />
  )
}

const OrganizationKYCStatusContainer = ({
  organization,
  isAdmin = true,
}: {
  organization: Organization
  isAdmin?: boolean
}) => {
  const {
    data: kycOrganizations,
    isLoading,
    isError,
  } = useOrganizationKycTeams({ organizationId: organization.id })

  if (isError) {
    console.error("Error loading KYC organizations data")
  }

  if (isLoading) {
    return <KYCSkeleton />
  }

  if (!kycOrganizations || kycOrganizations.length === 0) {
    return null
  }

  // Group KYC organizations by status - only include teams that have users
  const kycTeamsWithStatus = kycOrganizations
    .map((kycOrg) => {
      // We need to check TAM users (all users in the org's KYC team)
      // Flatten all users from the organization's KYC team structure
      const tamUsers = kycOrg.team.team.flatMap((t: any) => t.users || [])
      const hasActiveStream =
        kycOrg.team.rewardStreams && kycOrg.team.rewardStreams.length > 0

      const orgStatus = (
        tamUsers && tamUsers.length > 0
          ? resolveProjectStatus(tamUsers)
          : "PENDING"
      ) as import("@/components/projects/types").ExtendedPersonaStatus

      return {
        kycOrg,
        users: tamUsers,
        status: orgStatus,
        hasActiveStream,
      }
    })
    .filter((team) => team.users.length > 0) // Only show teams that have users

  const verifiedTeams = kycTeamsWithStatus.filter(
    (team) => team.status === "APPROVED",
  )
  const inProgressTeams = kycTeamsWithStatus.filter(
    (team) => team.status !== "APPROVED",
  )

  return (
    <div className="space-y-8">
      {/* Verified Addresses Section */}
      {verifiedTeams.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-semibold text-xl leading-6 text-text-default">
            Verified
          </h4>
          {verifiedTeams.map((team) => (
            <OrganizationKYCTeamCard
              key={team.kycOrg.kycTeamId}
              kycOrg={team.kycOrg}
              users={team.users}
              status={team.status}
              hasActiveStream={team.hasActiveStream}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* In Progress Addresses Section */}
      {inProgressTeams.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-semibold text-xl leading-6 text-text-default">
            In Progress
          </h4>
          {inProgressTeams.map((team) => (
            <OrganizationKYCTeamCard
              key={team.kycOrg.kycTeamId}
              kycOrg={team.kycOrg}
              users={team.users}
              status={team.status}
              hasActiveStream={team.hasActiveStream}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const OrganizationKYCTeamCard = ({
  kycOrg,
  users,
  status,
  hasActiveStream,
  isAdmin = true,
}: {
  kycOrg: any // TODO: type this properly
  users: any[]
  status: import("@/components/projects/types").ExtendedPersonaStatus
  hasActiveStream: boolean
  isAdmin?: boolean
}) => {
  const { sendingEmailUsers, handleEmailResend } = useKYCEmailResend({
    organizationId: kycOrg.organizationId,
  })

  const userMappings = users.map((user) => ({
    user,
    handleEmailResend,
    emailResendBlock:
      !isAdmin || status === "project_issue" || user.status === "APPROVED",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
  }))

  return (
    <KYCStatusPresenter
      status={status}
      address={kycOrg.team.walletAddress || ""}
      users={userMappings}
      isLoading={false}
      kycTeamId={kycOrg.kycTeamId}
      extraMiddleContent={
        <ConnectedOrganizationProjects
          kycTeam={kycOrg}
          hasActiveStream={hasActiveStream}
          isAdmin={isAdmin}
        />
      }
      showEditFooter
      isAdmin={isAdmin}
    />
  )
}

export { KYCStatusTitle }

export default KYCStatusContainer

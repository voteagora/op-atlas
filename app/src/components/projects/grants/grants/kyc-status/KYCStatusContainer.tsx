"use client"

import { KYCUser, Organization } from "@prisma/client"
import { useState } from "react"

import TrackedLink from "@/components/common/TrackedLink"
import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import { EmailState, ProjectWithKycTeam } from "@/components/projects/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"
import { sendKYCReminderEmail } from "@/lib/actions/emails"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import ConnectedOrganizationProjects from "@/components/projects/grants/grants/kyc-status/ConnctedOrganizationProjects"
import { ReactNode, useCallback } from "react"

const KYCStatusContainer = ({
  project,
  organization,
}: {
  project?: ProjectWithKycTeam
  organization?: Organization
}) => {
  if (!project && !organization) {
    return <div>Project or organization not found</div>
  }
  return (
    <div className="flex flex-col w-full max-w-[712px] gap-6">
      {project ? (
        <ProjectKYCStatusContainer project={project} />
      ) : (
        organization && (
          <OrganizationKYCStatusContainer organization={organization} />
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

const KYCStatusTitle = () => {
  return (
    <div className="space-y-6">
      <h2>Grant Delivery Address</h2>
      <p className="text-secondary-foreground font-normal">
        Add the wallet address your rewards will be delivered to. Identity
        verification is required for each address.
      </p>
      <p className="text-secondary-foreground font-normal">
        Get started by submitting the grant eligibility form.
      </p>
    </div>
  )
}

// Shared hook to manage resend email state/handler
const useKYCEmailResend = () => {
  const [sendingEmailUsers, setSendingEmailUsers] = useState<
    Record<string, EmailState>
  >({})

  const handleEmailResend = useCallback(async (kycUser: KYCUser) => {
    console.log(`attempting to send email to ${kycUser.email}`)
    setSendingEmailUsers((prev) => ({
      ...prev,
      [kycUser.id]: EmailState.SENDING,
    }))
    try {
      const response = await sendKYCReminderEmail(kycUser)
      console.log("Email resend success:", response)
    } catch (error) {
      console.error("Failed to send email:", error)
    } finally {
      setSendingEmailUsers((prev) => ({
        ...prev,
        [kycUser.id]: EmailState.SENT,
      }))
    }
  }, [])

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
}: {
  status: "pending" | "completed" | "project_issue"
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
}) => {
  const individualStatuses = users
    ? users.filter((u) => u.user.kycUserType === "USER")
    : []
  const legalEntitiesStatuses = users
    ? users.filter((u) => u.user.kycUserType === "LEGAL_ENTITY")
    : []
  return (
    <>
      <h4 className="font-semibold text-xl leading-6 text-text-default">
        {status !== "completed" ? "In progress" : "Verified"}
      </h4>
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
                <IndividualStatuses users={individualStatuses} />
                {users.some((u) => u.user.kycUserType === "LEGAL_ENTITY") && (
                  <LegalEntities users={legalEntitiesStatuses} />
                )}
              </>
            )}
            {showEditFooter && status !== "completed" && (
              <div className="flex flex-row w-full max-w-[664px] justify-center items-center gap-2">
                <p className="font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
                  Is something missing or incorrect?
                </p>
                <span>
                  <TrackedLink
                    eventName={"grant-address edit form"}
                    href={"" /*TODO*/}
                  >
                    <p className="underline font-[Inter] text-[14px] font-[400] leading-[20px] text-center">
                      Edit form
                    </p>
                  </TrackedLink>
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
}: {
  project: ProjectWithKycTeam
}) => {
  const {
    data: kycUsers,
    isLoading,
    isError,
  } = useKYCProject({ projectId: project.id })
  const projectStatus = kycUsers ? resolveProjectStatus(kycUsers) : "pending"

  const { sendingEmailUsers, handleEmailResend } = useKYCEmailResend()

  const users = kycUsers?.map((user) => ({
    user,
    handleEmailResend,
    emailResendBlock:
      projectStatus === "project_issue" ||
      user.personaStatus === "approved" ||
      user.personaStatus === "completed",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
  }))

  if (isError) {
    console.error("Error loading KYC users data")
  }

  return (
    <KYCStatusPresenter
      status={projectStatus}
      address={project.kycTeam?.walletAddress || ""}
      users={users}
      isLoading={isLoading}
      kycTeamId={project.kycTeam?.id}
      showEditFooter
    />
  )
}

const OrganizationKYCStatusContainer = ({
  organization,
}: {
  organization: Organization
}) => {
  const {
    data: kycOrganizations,
    isLoading,
    isError,
  } = useOrganizationKycTeams({ organizationId: organization.id })

  const kycUsers = kycOrganizations?.flatMap((org) => {
    return org.team.team.map((team) => team.users)
  })

  // Let's just assume one organization has one team for the time being and tackle edge cases later
  const kycOrg = kycOrganizations?.[0]

  const orgStatus = kycUsers ? resolveProjectStatus(kycUsers) : "pending"

  const { sendingEmailUsers, handleEmailResend } = useKYCEmailResend()

  const users = kycUsers?.map((user) => ({
    user,
    handleEmailResend,
    emailResendBlock:
      orgStatus === "project_issue" ||
      user.personaStatus === "approved" ||
      user.personaStatus === "completed",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
  }))

  if (isError) {
    console.error("Error loading KYC users data")
  }

  return (
    <KYCStatusPresenter
      status={orgStatus}
      address={kycOrg?.team.walletAddress || ""}
      users={users}
      isLoading={isLoading}
      extraMiddleContent={
        <ConnectedOrganizationProjects organizationId={organization.id} />
      }
      showEditFooter
    />
  )
}

export { KYCStatusTitle }

export default KYCStatusContainer

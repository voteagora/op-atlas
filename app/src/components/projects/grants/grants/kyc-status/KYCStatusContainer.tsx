"use client"

import { KYCUser, Project } from "@prisma/client"
import { useSession } from "next-auth/react"

import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import { useKYCProject } from "@/hooks/db/useKYCProject"

const resolveProjectStatus = (users: Pick<KYCUser, "personaStatus">[]) => {
  // If any users are expired, failed, or declined, return "project_issue"
  if (
    users.some(
      (user) =>
        user.personaStatus === "expired" ||
        user.personaStatus === "failed" ||
        user.personaStatus === "declined",
    )
  ) {
    return "project_issue"
  }

  // If any users are created or pending, resolve to that status
  if (
    users.some(
      (user) =>
        user.personaStatus === "created" || user.personaStatus === "pending",
    )
  ) {
    return (
      users.find(
        (user) =>
          user.personaStatus === "created" || user.personaStatus === "pending",
      )?.personaStatus || "pending"
    )
  }

  // If all users are completed or approved, resolve to "completed"
  if (
    users.every(
      (user) =>
        user.personaStatus === "completed" || user.personaStatus === "approved",
    )
  ) {
    return "completed"
  }

  // Default fallback
  return "pending"
}

const KYCStatusContainer = ({ project }: { project: Project }) => {
  const { data: session } = useSession()
  const {
    data: kycUsers,
    isLoading,
    isError,
  } = useKYCProject({ projectId: project.id })
  const projectStatus = kycUsers ? resolveProjectStatus(kycUsers) : "pending"

  const handleEmailResend = (emailAddress: string) => {
    console.log(`Resending email to ${emailAddress}`)
  }

  // Use mock data if we're loading or have an error
  const users = kycUsers?.map((user) => ({
    user,
    handleEmailResend: handleEmailResend,
    emailResendBlock:
      projectStatus === "project_issue" ||
      user.personaStatus === "approved" ||
      user.personaStatus === "completed",
    isUser: session?.user.id === user.id,
  }))

  if (isError) {
    console.error("Error loading KYC users data")
  }

  const individualStatuses = users
    ? users.filter((user) => user.user.kycUserType === "USER")
    : []

  const legalEntitiesStatuses = users
    ? users.filter((user) => user.user.kycUserType === "LEGAL_ENTITY")
    : []
  console.log({ users, project })

  return (
    <div className="flex flex-col max-w-[762px] gap-6">
      <h4>
        {projectStatus === "pending" || projectStatus === "created"
          ? "In progress"
          : "Verified"}
      </h4>
      <div className="flex flex-col w-[762px] min-h-[640px] border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading KYC data...</p>
          </div>
        ) : (
          <>
            <ProjectStatus status={projectStatus} />
            <GrantDeliveryAddress address={project.kycTeam.walletAddress} />
            {users && users.length > 0 && (
              <>
                <IndividualStatuses users={individualStatuses} />
                <LegalEntities users={legalEntitiesStatuses} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default KYCStatusContainer

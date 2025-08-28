"use client"

import { KYCUser, Project } from "@prisma/client"
import { useSession } from "next-auth/react"

import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { sendKYCReminderEmail } from "@/lib/actions/emails"
import { resolveProjectStatus } from "@/lib/utils/kyc"

const KYCStatusContainer = ({ project }: { project: Project }) => {
  const { data: session } = useSession()
  const {
    data: kycUsers,
    isLoading,
    isError,
  } = useKYCProject({ projectId: project.id })
  const projectStatus = kycUsers ? resolveProjectStatus(kycUsers) : "pending"

  const handleEmailResend = (kycUser: KYCUser) => {
    console.log(`attempting to send email to ${kycUser.email}`)
    try {
      sendKYCReminderEmail(kycUser)
        .then((r) => console.log("email resend", r))
        .catch((err) => console.error(err))
    } catch (error) {
      console.log(error)
    }
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
                {users.some(
                  (user) => user.user.kycUserType === "LEGAL_ENTITY",
                ) && <LegalEntities users={legalEntitiesStatuses} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default KYCStatusContainer

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
import { useState } from "react"
import { EmailState, ProjectWithKycTeam } from "@/components/projects/types"
import TrackedLink from "@/components/common/TrackedLink"
import { Skeleton } from "@/components/ui/skeleton"

const KYCStatusContainer = ({ project }: { project: ProjectWithKycTeam }) => {
  const { data: session } = useSession()
  const {
    data: kycUsers,
    isLoading,
    isError,
  } = useKYCProject({ projectId: project.id })
  const projectStatus = kycUsers ? resolveProjectStatus(kycUsers) : "pending"

  const [sendingEmailUsers, setSendingEmailUsers] = useState<
    Record<string, EmailState>
  >({})

  const handleEmailResend = async (kycUser: KYCUser) => {
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
      // Set "sending" state to false for this user
      setSendingEmailUsers((prev) => ({
        ...prev,
        [kycUser.id]: EmailState.SENT,
      }))
    }
  }

  const users = kycUsers?.map((user) => ({
    user,
    handleEmailResend: handleEmailResend,
    emailResendBlock:
      projectStatus === "project_issue" ||
      user.personaStatus === "approved" ||
      user.personaStatus === "completed",
    isUser: session?.user.id === user.id,
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
  }))

  console.log({ users })

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
    <div className="flex flex-col w-full max-w-[712px] gap-6">
      <h4 className="font-semibold text-xl leading-6 text-text-default">
        {projectStatus !== "completed" ? "In progress" : "Verified"}
      </h4>
      <div className="flex flex-col max-w border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        {isLoading ? (
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
        ) : (
          <>
            <ProjectStatus status={projectStatus} />
            <GrantDeliveryAddress
              address={project.kycTeam.walletAddress || ""}
            />
            {users && users.length > 0 && (
              <>
                <IndividualStatuses users={individualStatuses} />
                {users.some(
                  (user) => user.user.kycUserType === "LEGAL_ENTITY",
                ) && <LegalEntities users={legalEntitiesStatuses} />}
              </>
            )}
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
          </>
        )}
      </div>
    </div>
  )
}

const KYCStatusTitle = () => {
  return (
    <div className="space-y-6">
      <h2>Grant Delivery Address</h2>
      <p className="text-secondary-foreground font-normal">
        Add the wallet address your rewards will be delivered to. Identity
        verification is required for each address.
      </p>
    </div>
  )
}

export { KYCStatusTitle }

export default KYCStatusContainer

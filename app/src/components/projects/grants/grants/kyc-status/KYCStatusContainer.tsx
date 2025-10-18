"use client"

import { KYCUser, Organization } from "@prisma/client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ReactNode, useCallback } from "react"
import { toast } from "sonner"

import ConnectedOrganizationProjects from "@/components/projects/grants/grants/kyc-status/ConnctedOrganizationProjects"
import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import {
  EmailState,
  ProjectWithKycTeam,
  KYCUserStatusProps,
  KYCOrLegal,
  isLegalEntityContact,
} from "@/components/projects/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"
import { sendKYCReminderEmail, sendKYBReminderEmail } from "@/lib/actions/emails"
import { resolveProjectStatus, hasExpiredKYC } from "@/lib/utils/kyc"
import { useAppDialogs } from "@/providers/DialogProvider"
import { getSelectedLegalEntitiesForTeam } from "@/lib/actions/kyc"

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

const KYCStatusTitle = ({
  hasKYCTeamWithUsers = false,
}: {
  hasKYCTeamWithUsers?: boolean
}) => {
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
        const response = await sendKYCReminderEmail(kycUser, context)
        if (!response.success) {
          toast.error(response.error || "Failed to send reminder email")
          setSendingEmailUsers((prev) => ({
            ...prev,
            [kycUser.id]: EmailState.NOT_SENT,
          }))
          return
        }

        console.log("Email resend success:", response)
        setSendingEmailUsers((prev) => ({
          ...prev,
          [kycUser.id]: EmailState.SENT,
        }))
      } catch (error) {
        console.error("Failed to send email:", error)
        toast.error("Failed to send reminder email")
        setSendingEmailUsers((prev) => ({
          ...prev,
          [kycUser.id]: EmailState.NOT_SENT,
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
  users: import("@/components/projects/types").KYCUserStatusProps[] | undefined
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

  // Show all KYCUsers as individual statuses (no longer split by type)
  const individualStatuses = users ? users : []

  // Load legal entity statuses based on selected LegalEntity for this KYCTeam
  const [legalEntitiesStatuses, setLegalEntitiesStatuses] = useState<
    KYCUserStatusProps[]
  >([])
  const [legalSendingState, setLegalSendingState] = useState<
    Record<string, EmailState>
  >({})
  const [legalRestartingState, setLegalRestartingState] = useState<
    Record<string, EmailState>
  >({})
  // Raw legal entity items linked to this KYC team; map to rows separately so
  // email spinner state updates (SENDING -> SENT) are reflected immediately.
  type SelectedTeamLegalEntity = {
    id: string
    name: string
    status: import("@prisma/client").KYCStatus | null
    expiry: Date | string | null
    controllerFirstName: string
    controllerLastName: string
    controllerEmail: string
  }
  const [legalItems, setLegalItems] = useState<SelectedTeamLegalEntity[]>([])

  // Fetch raw legal entity items when KYC team changes
  useEffect(() => {
    let cancelled = false
    async function loadLegalEntities() {
      try {
        if (!kycTeamId) {
          setLegalItems([])
          setLegalEntitiesStatuses([])
          return
        }
        const items = (await getSelectedLegalEntitiesForTeam(
          kycTeamId,
        )) as SelectedTeamLegalEntity[]
        if (cancelled) return
        setLegalItems(items || [])
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load legal entity statuses", e)
          setLegalItems([])
        }
      }
    }
    loadLegalEntities()
    return () => {
      cancelled = true
    }
  }, [kycTeamId])

  // Map raw items to UI rows; recompute when spinner state or context changes
  useEffect(() => {
    const mapped: KYCUserStatusProps[] = (legalItems || []).map((e) => {
      const contact: import("@/components/projects/types").LegalEntityContact = {
        id: e.id,
        email: e.controllerEmail || "",
        firstName: e.controllerFirstName || "",
        lastName: e.controllerLastName || "",
        businessName: e.name,
        status: e.status ?? undefined,
        expiry: e.expiry || null,
        kycUserType: "LEGAL_ENTITY",
      }
      return {
        user: contact,
        handleEmailResend: async (target: KYCOrLegal) => {
          console.debug("[KYCLegalEntity][UI] Resend click handler invoked", {
            target,
            kycTeamId,
            projectId,
            organizationId,
          })
          setLegalSendingState((prev) => ({
            ...prev,
            [e.id]: EmailState.SENDING,
          }))

          if (!isLegalEntityContact(target)) {
            console.warn(
              "[KYCLegalEntity][UI] Email resend handler received a non-legal entity target.",
              { target },
            )
            setLegalSendingState((prev) => ({
              ...prev,
              [e.id]: EmailState.NOT_SENT,
            }))
            return
          }

          try {
            console.debug("[KYCLegalEntity][UI] Calling sendKYBReminderEmail", {
              id: target.id,
              projectId,
              organizationId,
            })
            const res = await sendKYBReminderEmail(
              { id: target.id },
              {
                projectId: projectId as string | undefined,
                organizationId: organizationId as string | undefined,
              },
            )
            console.debug("[KYCLegalEntity][UI] sendKYBReminderEmail response", res)

            if (!res.success) {
              toast.error(res.error || "Failed to send reminder email")
              setLegalSendingState((prev) => ({
                ...prev,
                [e.id]: EmailState.NOT_SENT,
              }))
              return
            }

            setLegalSendingState((prev) => ({
              ...prev,
              [e.id]: EmailState.SENT,
            }))
          } catch (err) {
            console.error("[KYCLegalEntity][UI] resend handler failed", err)
            toast.error("Failed to send reminder email")
            setLegalSendingState((prev) => ({
              ...prev,
              [e.id]: EmailState.NOT_SENT,
            }))
          }
        },
        handleRestart: async (target: KYCOrLegal) => {
          console.debug("[KYCLegalEntity][UI] Restart click handler invoked", {
            target,
            kycTeamId,
            projectId,
            organizationId,
          })
          setLegalRestartingState((prev) => ({
            ...prev,
            [e.id]: EmailState.SENDING,
          }))

          if (!isLegalEntityContact(target)) {
            console.warn(
              "[KYCLegalEntity][UI] Restart handler received a non-legal entity target.",
              { target },
            )
            setLegalRestartingState((prev) => ({
              ...prev,
              [e.id]: EmailState.NOT_SENT,
            }))
            return
          }

          try {
            const { restartKYCForExpiredLegalEntity } = await import("@/lib/actions/kyc")
            const result = await restartKYCForExpiredLegalEntity({
              legalEntityId: target.id,
              kycTeamId: kycTeamId!,
              projectId: projectId as string | undefined,
              organizationId: organizationId as string | undefined,
            })

            if ("error" in result && result.error) {
              toast.error(result.error)
              setLegalRestartingState((prev) => ({
                ...prev,
                [e.id]: EmailState.NOT_SENT,
              }))
              return
            }

            setLegalRestartingState((prev) => ({
              ...prev,
              [e.id]: EmailState.SENT,
            }))
            // Trigger page refresh to show updated data
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          } catch (err) {
            console.error("[KYCLegalEntity][UI] restart handler failed", err)
            toast.error("Failed to restart KYB")
            setLegalRestartingState((prev) => ({
              ...prev,
              [e.id]: EmailState.NOT_SENT,
            }))
          }
        },
        emailResendBlock: e.status === "APPROVED",
        emailState: legalSendingState[e.id] || EmailState.NOT_SENT,
        restartState: legalRestartingState[e.id] || EmailState.NOT_SENT,
      }
    })
    setLegalEntitiesStatuses(mapped)
  }, [legalItems, legalSendingState, legalRestartingState, projectId, organizationId, kycTeamId])
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
            {individualStatuses && individualStatuses.length > 0 && (
              <IndividualStatuses
                users={individualStatuses}
                isAdmin={isAdmin}
              />
            )}
            {legalEntitiesStatuses && legalEntitiesStatuses.length > 0 && (
              <LegalEntities users={legalEntitiesStatuses} isAdmin={isAdmin} />
            )}
            {showEditFooter && isAdmin && (
              <div className="flex flex-row w-full max-w-[664px] justify-center items-center gap-2">
                <p className="font-riforma text-[14px] font-[400] leading-[20px] text-center">
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
                  <p className="underline font-riforma text-[14px] font-[400] leading-[20px] text-center">
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

  const [restartingUsers, setRestartingUsers] = useState<Record<string, EmailState>>({})

  const handleRestartKYC = useCallback(
    async (target: KYCOrLegal) => {
      setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.SENDING }))

      try {
        const { restartKYCForExpiredUser, restartKYCForExpiredLegalEntity } = await import("@/lib/actions/kyc")

        let result
        if (isLegalEntityContact(target)) {
          // It's a legal entity
          result = await restartKYCForExpiredLegalEntity({
            legalEntityId: target.id,
            kycTeamId: project.kycTeam!.id,
            projectId: project.id,
          })
        } else {
          // It's a KYCUser
          result = await restartKYCForExpiredUser({
            kycUserId: target.id,
            kycTeamId: project.kycTeam!.id,
            projectId: project.id,
          })
        }

        if ("error" in result && result.error) {
          toast.error(result.error)
          setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.NOT_SENT }))
        } else {
          setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.SENT }))
          // Trigger page refresh to show updated data
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } catch (error) {
        console.error("Error restarting KYC:", error)
        toast.error("Failed to restart KYC")
        setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.NOT_SENT }))
      }
    },
    [project.id, project.kycTeam]
  )

  const users: KYCUserStatusProps[] | undefined = kycUsers?.map((user) => ({
    user,
    handleEmailResend:
      handleEmailResend as KYCUserStatusProps["handleEmailResend"],
    handleRestart: handleRestartKYC,
    emailResendBlock:
      !isAdmin ||
      projectStatus === "project_issue" ||
      user.status === "APPROVED",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
    restartState: restartingUsers[user.id] || EmailState.NOT_SENT,
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
      const legalEntities =
        kycOrg.team.KYCLegalEntityTeams?.map(
          (entityTeam: any) => entityTeam.legalEntity,
        ).filter(Boolean) ?? []
      const hasActiveStream =
        kycOrg.team.rewardStreams && kycOrg.team.rewardStreams.length > 0
      const teamHasExpired = hasExpiredKYC(kycOrg.team)
      const legalEntityCount = legalEntities.length

      const userStatus =
        tamUsers && tamUsers.length > 0
          ? resolveProjectStatus(tamUsers)
          : undefined
      const legalHasRejected = legalEntities.some(
        (entity: any) => entity?.status === "REJECTED",
      )
      const legalHasPending = legalEntities.some(
        (entity: any) => entity?.status !== "APPROVED",
      )

      let orgStatus: import("@/components/projects/types").ExtendedPersonaStatus =
        "PENDING"

      if (teamHasExpired) {
        orgStatus = "EXPIRED"
      } else if (
        userStatus === "project_issue" ||
        legalHasRejected
      ) {
        orgStatus = "project_issue"
      } else if (
        userStatus === "PENDING" ||
        legalHasPending
      ) {
        orgStatus = "PENDING"
      } else if (
        (userStatus === "APPROVED" || userStatus === undefined) &&
        !legalHasPending &&
        (tamUsers.length > 0 || legalEntityCount > 0)
      ) {
        orgStatus = "APPROVED"
      }

      return {
        kycOrg,
        users: tamUsers,
        status: orgStatus,
        hasActiveStream,
        legalEntityCount,
      }
    })
    .filter(
      (team) =>
        team.users.length > 0 ||
        team.legalEntityCount > 0 ||
        team.status === "EXPIRED",
    ) // Only show teams that have users, legal entities, or expired records

  const verifiedTeams = kycTeamsWithStatus.filter(
    (team) => team.status === "APPROVED",
  )
  const expiredTeams = kycTeamsWithStatus.filter(
    (team) => team.status === "EXPIRED",
  )
  const inProgressTeams = kycTeamsWithStatus.filter(
    (team) => team.status !== "APPROVED" && team.status !== "EXPIRED",
  )

  return (
    <div className="space-y-8">
      {/* Verified Addresses Section */}
      {verifiedTeams.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-normal text-xl leading-6 text-text-default">
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

      {/* Expired Addresses Section */}
      {expiredTeams.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-normal text-xl leading-6 text-text-default">
            Expired
          </h4>
          {expiredTeams.map((team) => (
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
          <h4 className="font-normal text-xl leading-6 text-text-default">
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

  const [restartingUsers, setRestartingUsers] = useState<Record<string, EmailState>>({})

  const handleRestartKYC = useCallback(
    async (target: KYCOrLegal) => {
      setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.SENDING }))

      try {
        const { restartKYCForExpiredUser, restartKYCForExpiredLegalEntity } = await import("@/lib/actions/kyc")

        let result
        if (isLegalEntityContact(target)) {
          // It's a legal entity
          result = await restartKYCForExpiredLegalEntity({
            legalEntityId: target.id,
            kycTeamId: kycOrg.kycTeamId,
            organizationId: kycOrg.organizationId,
          })
        } else {
          // It's a KYCUser
          result = await restartKYCForExpiredUser({
            kycUserId: target.id,
            kycTeamId: kycOrg.kycTeamId,
            organizationId: kycOrg.organizationId,
          })
        }

        if ("error" in result && result.error) {
          toast.error(result.error)
          setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.NOT_SENT }))
        } else {
          setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.SENT }))
          // Trigger page refresh to show updated data
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } catch (error) {
        console.error("Error restarting KYC:", error)
        toast.error("Failed to restart KYC")
        setRestartingUsers(prev => ({ ...prev, [target.id]: EmailState.NOT_SENT }))
      }
    },
    [kycOrg.kycTeamId, kycOrg.organizationId]
  )

  const userMappings: KYCUserStatusProps[] = users.map((user) => ({
    user,
    handleEmailResend:
      handleEmailResend as KYCUserStatusProps["handleEmailResend"],
    handleRestart: handleRestartKYC,
    emailResendBlock:
      !isAdmin || status === "project_issue" || user.status === "APPROVED",
    emailState: sendingEmailUsers[user.id] || EmailState.NOT_SENT,
    restartState: restartingUsers[user.id] || EmailState.NOT_SENT,
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

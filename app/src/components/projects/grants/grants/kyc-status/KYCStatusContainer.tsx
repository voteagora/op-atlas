import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/user-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/user-status/LegalEntities"
import { KYCUserStatusProps, PersonaStatus } from "@/components/projects/types"

const mockAddress = "0xc2658A2d5ADf4a4F08f5c9b83D39816951465538"

const MOCK_USERS = [
  {
    name: "Shaun Lind",
    email: "shaun@optimism.io",
    organization: "Optimism Unlimited",
    status: "pending" as PersonaStatus,
  },
  {
    name: "Alex Johnson",
    email: "alex@optimism.io",
    organization: "Optimism Unlimited",
    status: "completed" as PersonaStatus,
    expirationDate: new Date("2026-08-11"),
  },
  {
    name: "Jamie Smith",
    email: "jamie@optimism.io",
    organization: "Optimism Unlimited",
    status: "needs_review" as PersonaStatus,
  },
  {
    name: "Taylor Brown",
    email: "taylor@optimism.io",
    organization: "Optimism Unlimited",
    status: "approved" as PersonaStatus,
    expirationDate: new Date("2026-01-01"),
  },
  {
    name: "Morgan Lee",
    email: "morgan@optimism.io",
    organization: "Optimism Unlimited",
    status: "declined" as PersonaStatus,
  },
]

const resolveProjectStatus = (users: KYCUserStatusProps[]) => {
  // If any users are expired, failed, or declined, return "project_issue"
  if (
    users.some(
      (user) =>
        user.status === "expired" ||
        user.status === "failed" ||
        user.status === "declined",
    )
  ) {
    return "project_issue"
  }

  // If any users are created or pending, resolve to that status
  if (
    users.some((user) => user.status === "created" || user.status === "pending")
  ) {
    return (
      users.find(
        (user) => user.status === "created" || user.status === "pending",
      )?.status || "pending"
    )
  }

  // If all users are completed or approved, resolve to "completed"
  if (
    users.every(
      (user) => user.status === "completed" || user.status === "approved",
    )
  ) {
    return "completed"
  }

  // Default fallback
  return "pending"
}

const KYCStatusContainer = () => {
  const projectStatus = resolveProjectStatus(MOCK_USERS)
  return (
    <div className="flex flex-col max-w-[762px] gap-6">
      <h4>
        {projectStatus === "pending" || projectStatus === "created"
          ? "In progress"
          : "Verified"}
      </h4>
      <div className="flex flex-col w-[762px] min-h-[640px] border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        <ProjectStatus status={projectStatus} />
        <GrantDeliveryAddress address={mockAddress} />
        <IndividualStatuses users={MOCK_USERS.slice(0, -1)} />
        <LegalEntities users={MOCK_USERS.slice(-1)} />
      </div>
    </div>
  )
}

export default KYCStatusContainer

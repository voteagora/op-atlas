import ProjectStatus from "@/components/projects/grants/grants/kyc-status/ProjectStatus"
import GrantDeliveryAddress from "@/components/projects/grants/grants/kyc-status/GrantDeliveryAddress"
import IndividualStatuses from "@/components/projects/grants/grants/kyc-status/IndividualStatuses"
import LegalEntities from "@/components/projects/grants/grants/kyc-status/LegalEntities"

const KYCStatusContainer = () => {
  const status = "pending"
  return (
    <div className="flex flex-col w-[762px] gap-6">
      <h4>{status == "pending" ? "In progress" : "Verified"}</h4>
      <div className="w-[762px] h-[640px] border p-6 gap-6 border-[#E0E2EB] rounded-[12px]">
        <ProjectStatus />
        <GrantDeliveryAddress />
        <IndividualStatuses />
        <LegalEntities />
      </div>
    </div>
  )
}

export default KYCStatusContainer

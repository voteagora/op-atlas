import { StatusIcon } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { ExtendedPersonaStatus } from "@/components/projects/types"

const ProjectStatus = ({ status }: { status: ExtendedPersonaStatus }) => {
  if (status === "completed") {
    return null
  }
  return (
    <div className="w-664px] h-[176px] rounded-[6px] p-6 gap-3 justify-center items-center flex flex-col">
      <div className={"text-center"}>
        <StatusIcon status={status} size={6} />
      </div>
      <p className="font-[Inter] font-medium text-[14px] leading-[20px] text-center text-text-foreground">
        We are checking for verifications
      </p>
      <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-center tracking-[0%] text-text-secondary">
        An email from [address@email.com] has been sent to each person declared
        in the grant eligibility form. They must complete KYC/KYB via the link
        provided. Please ensure everyone has taken action and allow 48 hours for
        your status to update.
      </p>
    </div>
  )
}

export default ProjectStatus

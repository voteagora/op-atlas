import { ReactNode } from "react"
import { ChevronRight, SquareCheck } from "lucide-react"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { useAppDialogs } from "@/providers/DialogProvider"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"

interface KYCSubSectionProps {
  title: string
  children: ReactNode
  kycTeamId?: string
  organizationId?: string
}

const KYCSubSection = ({
  title,
  children,
  kycTeamId,
  organizationId,
}: KYCSubSectionProps) => {
  return (
    <div className="flex flex-col gap-[8px] max-w-[664px]">
      <div className="flex items-center justify-between">
        <p className="font-[Inter] font-medium text-[14px] leading-[20px] text-text-foreground">
          {title}
        </p>
        {kycTeamId && organizationId && (
          <SelectProjectsButton
            kycTeamId={kycTeamId}
            organizationId={organizationId}
          />
        )}
      </div>

      <div className="flex flex-col gap-[12px]">{children}</div>
    </div>
  )
}

const SelectProjectsButton = ({
  kycTeamId,
  organizationId,
}: {
  kycTeamId: string
  organizationId: string
}) => {
  const { setData, setOpenDialog } = useAppDialogs()
  const { data: kycTeamProjects } = useOrganizationKycTeams({
    organizationId,
  })
  const openSelectKYCProjectDialog = () => {
    setData({
      kycTeamId: kycTeamId,
      alreadySelectedProjectIds: kycTeamProjects?.map((project) => project.id),
    })
    setOpenDialog("select_kyc_project")
  }
  return (
    <button
      className="flex items-center space-x-1"
      onClick={openSelectKYCProjectDialog}
    >
      <SquareCheck size={18} />
      <span>Choose</span>
      <ChevronRight size={14} />
    </button>
  )
}

export default KYCSubSection

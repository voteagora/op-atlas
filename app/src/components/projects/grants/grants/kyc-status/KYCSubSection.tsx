import { ReactNode } from "react"
import { ChevronRight, SquareCheck, LockIcon } from "lucide-react"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { useAppDialogs } from "@/providers/DialogProvider"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"

interface KYCSubSectionProps {
  title: string
  children: ReactNode
  kycTeamId?: string
  organizationId?: string
  hasActiveStream?: boolean
  isAdmin?: boolean
}

const KYCSubSection = ({
  title,
  children,
  kycTeamId,
  organizationId,
  hasActiveStream = false,
  isAdmin = true,
}: KYCSubSectionProps) => {
  return (
    <div className="flex flex-col gap-[8px] max-w-[664px]">
      <div className="flex items-center justify-between">
        <p className="font-riforma font-normal text-[14px] leading-[20px] text-text-foreground">
          {title}
        </p>
        {kycTeamId && organizationId && isAdmin && (
          <SelectProjectsButton
            kycTeamId={kycTeamId}
            organizationId={organizationId}
            hasActiveStream={hasActiveStream}
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
  hasActiveStream = false,
}: {
  kycTeamId: string
  organizationId: string
  hasActiveStream?: boolean
}) => {
  const { setData, setOpenDialog } = useAppDialogs()
  const { data: allOrgKycTeams } = useOrganizationKycTeams({
    organizationId,
  })
  
  const openSelectKYCProjectDialog = () => {
    // Find the current KYC team and get its project IDs
    const currentKycTeam = allOrgKycTeams?.find(team => team.kycTeamId === kycTeamId)
    const alreadySelectedProjectIds = currentKycTeam?.team.projects.map((project) => project.id) || []
    
    setData({
      kycTeamId: kycTeamId,
      organizationId: organizationId,
      alreadySelectedProjectIds,
      allOrgKycTeams, // Pass all KYC teams to detect conflicts
    })
    setOpenDialog("select_kyc_project")
  }

  // If there's an active stream, show locked state
  if (hasActiveStream) {
    return (
      <div
        className="flex items-center space-x-1 cursor-default"
        title="Active Superfluid stream, projects cannot be modified."
      >
        <LockIcon size={18} />
        <span className="text-sm">Locked</span>
      </div>
    )
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

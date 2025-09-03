import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useProject } from "@/hooks/db/useProject"
import { useOrganizationKycTeams } from "@/hooks/db/useOrganizationKycTeam"

const ConnectedOrganizationProjects = ({
  organizationId,
  kycTeamId,
}: {
  organizationId: string
  kycTeamId?: string
}) => {
  const { data: kycTeamProjects, isLoading } = useOrganizationKycTeams({
    organizationId,
  })
  const kycTeam = kycTeamProjects?.[0]

  console.log({ kycTeamProjects, kycTeam, ln: kycTeam?.team.projects.length })
  return (
    <KYCSubSection
      title="Projects"
      kycTeamId={kycTeamId}
      organizationId={organizationId}
    >
      <div className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : kycTeam && kycTeam?.team.projects.length > 0 ? (
          kycTeam.team.projects.map((project) => (
            <ProjectRow key={project.id} projectId={project.id} />
          ))
        ) : (
          <div>No projects selected</div>
        )}
      </div>
    </KYCSubSection>
  )
}

const ProjectRow = ({ projectId }: { projectId: string }) => {
  const { data: project } = useProject({ id: projectId })
  console.log({ project })
  if (!project) {
    return null
  }
  return (
    <div className="flex flex-row items-center justify-between py-2 px-3 gap-2 border rounded-md">
      <div className="flex flex-row gap-2">
        <div className="w-6 h-6">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-sm"></div>
          )}
        </div>
        <p className="font-inter text-sm font-normal leading-5">
          {project.name}
        </p>
      </div>
    </div>
  )
}

export default ConnectedOrganizationProjects

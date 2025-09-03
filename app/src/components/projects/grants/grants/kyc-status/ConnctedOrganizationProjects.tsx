import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useProject } from "@/hooks/db/useProject"

const ConnectedOrganizationProjects = ({
  organizationId,
  kycTeamId,
}: {
  organizationId: string
  kycTeamId?: string
}) => {
  const { data: organization, isLoading } = useOrganization({
    id: organizationId,
  })

  console.log({ organization })
  return (
    <KYCSubSection
      title="Projects"
      kycTeamId={kycTeamId}
      organizationId={organizationId}
    >
      <div className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : organization?.projects.length === 0 ? (
          <div>No projects found</div>
        ) : (
          organization?.projects.map((project) => (
            <ProjectRow key={project.id} projectId={project.projectId} />
          ))
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

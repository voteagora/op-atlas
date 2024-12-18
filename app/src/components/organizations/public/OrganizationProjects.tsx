import ProjectWithLink from "@/components/profile/public/ProjectWithLink"
import { OrganizationWithTeamAndProjects } from "@/lib/types"
import { cn } from "@/lib/utils"

function OrganizationProjects({
  className,
  organization,
}: {
  className?: string
  organization: OrganizationWithTeamAndProjects
}) {
  return (
    <div className={cn("flex flex-col gap-y-4 mt-12", className)}>
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {organization.projects.map((project) => (
          <ProjectWithLink key={project.id} project={project.project} />
        ))}
      </div>
    </div>
  )
}

export default OrganizationProjects

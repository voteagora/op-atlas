import ProjectWithLink from "@/components/organizations/public/ProjectWithLink"
import type { PublicOrganizationProfileDTO } from "@/lib/dto"
import { cn } from "@/lib/utils"

function OrganizationProjects({
  className,
  organization,
}: {
  className?: string
  organization: PublicOrganizationProfileDTO
}) {
  return (
    <div className={cn("flex flex-col gap-y-4 mt-12", className)}>
      <h2 className="text-xl font-normal">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {organization.projects
          .filter((project) => Boolean(project.project))
          .map((project) => (
            <ProjectWithLink key={project.id} project={project.project!} />
          ))}
      </div>
    </div>
  )
}

export default OrganizationProjects

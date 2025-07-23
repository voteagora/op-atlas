import { ProjectWithDetailsLite } from "@/lib/types"

import ProjectWithLink from "./ProjectWithLink"

function ProfileProjects({ projects }: { projects: ProjectWithDetailsLite[] }) {
  if (projects.length === 0) {
    // No projects at all
    return (
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-medium">Projects</h2>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">Not associated with any projects</p>
        </div>
      </div>
    )
  }

  // Projects exist
  const projectsWithApplications = projects.filter(
    (project) => project.applications && project.applications.length > 0
  )

  if (projectsWithApplications.length === 0) {
    // No projects with applications
    return (
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-medium">Projects</h2>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            None of this user&#39;s projects have applied for funding
          </p>
        </div>
      </div>
    )
  }

  // Render projects with applications
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col space-y-4">
        {projectsWithApplications.map((project) => (
          <ProjectWithLink key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

export default ProfileProjects
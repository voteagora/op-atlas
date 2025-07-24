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

  // Render projects if they exist
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col space-y-4">
        {projects.map((project) => (
          <ProjectWithLink key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

export default ProfileProjects
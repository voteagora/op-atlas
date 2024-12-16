import { ProjectWithDetails } from "@/lib/types"

import ProjectWithLink from "./ProjectWithLink"

function ProfileProjects({ projects }: { projects: ProjectWithDetails[] }) {
  if (projects.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {projects.map((project) => (
          <ProjectWithLink key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

export default ProfileProjects

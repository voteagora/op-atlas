import { ProjectWithDetailsLite } from "@/lib/types"

import ProjectWithLink from "./ProjectWithLink"

function ProfileProjects({ projects }: { projects: ProjectWithDetailsLite[] }) {


  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectWithLink key={project.id} project={project} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Not associated with any projects</p>
        )}
      </div>
    </div>
  )
}

export default ProfileProjects

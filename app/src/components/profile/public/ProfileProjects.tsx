import { Scale } from "lucide-react"
import Image from "next/image"

import { ProjectWithDetailsLite } from "@/lib/types"

import ProjectWithLink from "./ProjectWithLink"

function ProfileProjects({ projects }: { projects: ProjectWithDetailsLite[] }) {

  const projectsWithApplications = projects.filter(
    (project) => project.applications && project.applications.length > 0,
  )

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col space-y-4">
        {projectsWithApplications.length > 0 ? (
          projectsWithApplications.map((project) => (
            <ProjectWithLink key={project.id} project={project} />
          ))
        ) : (
          <div className="flex items-center space-x-3 py-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
              <Scale className="w-6 h-6 text-muted" />
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-foreground">
                No Retro Funding projects yet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileProjects

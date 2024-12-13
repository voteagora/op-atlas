import Image from "next/image"

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
    <div className={cn("flex flex-col gap-y-4 mt-12", className)} >
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {organization.projects.map((project) => (
          <div key={project.id} className="flex items-center gap-x-3">
            {project.project.thumbnailUrl ? (
              <Image
                src={project.project.thumbnailUrl ?? ""}
                alt={project.project.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span>{project.project.name.charAt(0)}</span>
              </div>
            )}
            <span>{project.project.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrganizationProjects

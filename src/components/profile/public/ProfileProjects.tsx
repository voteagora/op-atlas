import Image from "next/image"

import { ProjectWithDetails } from "@/lib/types"

function ProfileProjects({ projects }: { projects: ProjectWithDetails[] }) {
  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-x-3">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl ?? ""}
                alt={project.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span>{project.name.charAt(0)}</span>
              </div>
            )}
            <span>{project.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileProjects

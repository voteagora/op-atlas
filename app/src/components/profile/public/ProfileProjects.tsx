import Image from "next/image"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import { ProjectWithDetails } from "@/lib/types"

function ProfileProjects({ projects }: { projects: ProjectWithDetails[] }) {
  if (projects.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 mt-12">
      <h2 className="text-xl font-medium">Projects</h2>
      <div className="flex flex-col gap-y-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-x-3">
            {project.applications.length > 0 ? (
              <OutboundArrowLink
                text={project.name}
                target={`https://round${project.applications[0].roundId}.retrolist.app/project/${project.id}`}
                subtext={
                  project.rewards.length
                    ? `Rewarded in Retro Funding ${project.rewards
                        .map((reward) => reward.roundId)
                        .join(", ")}`
                    : undefined
                }
                icon={
                  project.thumbnailUrl ? (
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
                  )
                }
              />
            ) : (
              <>
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
                <Image
                  src="/assets/icons/arrow-up-right.svg"
                  width={10}
                  height={10}
                  alt="External link"
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {project.rewards.length && (
                  <span className="text-md text-gray-500">
                    Rewarded in Retro Funding{" "}
                    {project.rewards.map((reward) => reward.roundId).join(", ")}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileProjects

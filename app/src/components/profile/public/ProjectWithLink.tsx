import Image from "next/image"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import { ProjectWithDetailsWithoutOrganization } from "@/lib/types"

function ProjectWithLink({
  project,
}: {
  project: ProjectWithDetailsWithoutOrganization
}) {
  return (
    <div className="flex items-center gap-x-3">
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
        </>
      )}
    </div>
  )
}

export default ProjectWithLink

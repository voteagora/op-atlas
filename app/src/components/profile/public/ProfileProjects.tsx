import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { ArrowDownS } from "@/components/icons/remix"
import { ProjectWithDetailsLite } from "@/lib/types"
import { cn, formatNumber } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

function ProfileProjects({ projects }: { projects: ProjectWithDetailsLite[] }) {
  const [showAll, setShowAll] = useState(false)

  const filteredProjects = showAll ? projects : projects.slice(0, 5)
  const hasMore = projects.length > 5

  const { track } = useAnalytics()

  const handleClick = ({
    eventName,
    eventData,
    text,
    href,
  }: {
    eventName: string
    eventData?: Record<string, unknown>
    text: string
    href: string
  }) => {
    track(eventName, {
      ...eventData,
      elementType: "link",
      elementName: text,
      url: href,
      href, // Keep for backward compatibility
      text, // Keep for backward compatibility
    })
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-xl font-normal">Projects</h2>
      <div className="flex flex-col space-y-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-gray-200 p-6 bg-background group/card flex flex-row gap-x-1.5 items-center justify-between hover:bg-[#F2F3F8] hover:cursor-pointer"
          >
            <Link
              href={`/project/${project.id}`}
              className="flex flex-row justify-between gap-3 w-full items-center"
              role="button"
              tabIndex={0}
              onClick={() =>
                handleClick({
                  eventName: "Link Click",
                  eventData: {
                    projectId: project.id,
                    source: "Profile",
                    linkName: "Project",
                  },
                  text: project.name,
                  href: `/project/${project.id}`,
                })
              }
            >
              <span className="flex flex-row items-center gap-3 group-hover/card:underline">
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl ?? ""}
                    alt={project.name}
                    width={48}
                    height={48}
                    className=" object-cover rounded-md inline-block"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                    <span>{project.name.charAt(0)}</span>
                  </div>
                )}
                {project.name}
              </span>
              <span className="flex flex-row gap-3">
                {project.rewards.map((reward) => {
                  return (
                    <span
                      key={reward.id}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full border border-transparent group-hover/card:border-border inline-flex gap-1.5 items-center"
                    >
                      <Image
                        className="w-[14px] h-[14px] rounded-[144px]"
                        src={"/assets/icons/op-icon.svg"}
                        alt={project.name}
                        width={14}
                        height={14}
                      />
                      <span className="text-center text-sm font-normal">
                        {formatNumber(
                          Number(reward.amount.toFixed(0)),
                          0,
                          "compact",
                        )}
                      </span>
                    </span>
                  )
                })}
              </span>
            </Link>{" "}
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm hover:underline text-left pt-3 "
          >
            {showAll
              ? `Hide ${projects.length - 5} more`
              : `Show ${projects.length - 5} more`}
            <ArrowDownS
              className={cn(
                "w-4 h-4 ml-1 transition-transform duration-300 inline-block",
                showAll && "rotate-180",
              )}
            />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileProjects

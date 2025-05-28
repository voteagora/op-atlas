import Image from "next/image"

import { getWeightedRandomGrantRecipients } from "@/db/projects"

import TrackedLink from "../common/TrackedLink"
import { RewardedProjectContainer } from "./RewardedProjectContainer"

export const revalidate = 60 // 1 minute

export const RewardedProjectCrousel = async () => {
  const projects = await getWeightedRandomGrantRecipients()

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xl font-semibold">
        Over 500 builders have been rewarded
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
        {projects.map((project) => (
          <RewardedProjectContainer key={project.id} project={project} />
        ))}
      </div>
      <div className="flex flex-col gap-2 items-center">
        <TrackedLink
          href="/round/results?rounds=7,8"
          eventName="Link Click"
          eventData={{
            source: "home_page",
            linkName: "See all rewarded projects",
            linkUrl: "/round/results?rounds=7,8",
          }}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors text-sm w-fit"
        >
          See all
          <Image
            src="/assets/icons/arrow-right-s-line.svg"
            alt="Arrow right"
            width={20}
            height={20}
          />
        </TrackedLink>
      </div>
    </div>
  )
}

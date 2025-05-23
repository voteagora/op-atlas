import { getWeightedRandomGrantRecipients } from "@/db/projects"

import { RewardedProjectContainer } from "./RewardedProjectContainer"

export const RewardedProjectCrousel = async () => {
  const projects = await getWeightedRandomGrantRecipients()

  return (
    <div>
      <h4 className="text-xl font-semibold">
        Over 500 builders have been rewarded
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
        {projects.map((project) => (
          <RewardedProjectContainer key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

import Image from "next/image"

import { ProjectWithReward } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import Link from "next/link"

type RewardedProjectContainerProps = {
  project: ProjectWithReward
}

export const RewardedProjectContainer = ({
  project,
}: RewardedProjectContainerProps) => {
  const totalReward = project.rewards.reduce(
    (acc, reward) => acc + Number(reward.amount),
    0,
  )

  return (
    <Link href={`/project/${project.id}`} className="group">
      <div className="h-[316px] flex flex-col justify-between border border-border rounded-lg p-6 gap-6 overflow-hidden">
        <div className="flex flex-col justify-top gap-6">
          <Image
            src={project.thumbnailUrl ?? ""}
            alt={project.name}
            className="w-16 h-16 rounded-lg"
            width={64}
            height={64}
          />
          <div>
            <text className="font-semibold overflow-none line-clamp-1 group-hover:underline">
              {project.name}
            </text>
            <text className="text-secondary-foreground line-clamp-4">
              {project.description}
            </text>
          </div>
        </div>
        <div className="w-fit bg-red-100 rounded-2xl px-3 py-1 flex items-center gap-2">
          <Image
            src="/assets/images/op-logo.svg"
            alt="OP"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <p className="text-red-600">
            {formatNumber(totalReward, 0, "compact")}
          </p>
        </div>
      </div>
    </Link>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { memo, useMemo } from "react"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { unclaimedRewards } from "@/lib/rewards"
import { ProjectWithDetails } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

function UnclaimedRewardsDialog({
  open,
  onOpenChange,
  projects,
}: DialogProps<{ projects: ProjectWithDetails[] }>) {
  const projectsWithUnclaimedRewards = useMemo(() => {
    return projects.filter((project) => unclaimedRewards(project).length > 0)
  }, [projects])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 max-w-xl overflow-hidden">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/assets/icons/sunny-smiling.png"
            width={80}
            height={80}
            alt="Sunny face"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-lg font-semibold text-text-default">
              You received rewards!
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-w-full">
          {projectsWithUnclaimedRewards.map((project) => (
            <ProjectRewardRow key={project.id} project={project} />
          ))}
          <DialogFooter className="w-full">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              type="button"
              variant="secondary"
            >
              Claim later
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(UnclaimedRewardsDialog)

export function ProjectRewardRow({ project }: { project: ProjectWithDetails }) {
  return (
    <div className="border border-border bg-background rounded-xl p-8 flex items-center gap-4 max-w-full">
      {project.thumbnailUrl && (
        <Image
          src={project.thumbnailUrl}
          height={48}
          width={48}
          className="rounded-md"
          alt="Project thumbnail"
        />
      )}
      <div className="font-semibold flex-1 min-w-0 text-nowrap overflow-hidden overflow-ellipsis mr-8">
        {project.name}
      </div>
      <div className="flex items-center gap-2">
        <Image
          src="/assets/chain-logos/optimism.png"
          height={24}
          width={24}
          alt="Optimism"
        />
        <div className="font-semibold">
          {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
          {formatNumber(project.rewards[0].amount)}
        </div>
      </div>
      <Link href={`/rewards/${project.rewards[0].id}`}>
        <Button variant="destructive">Claim</Button>
      </Link>
    </div>
  )
}

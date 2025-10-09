"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { useGetRandomProjects } from "@/hooks/db/useGetRandomProjects"
import { noRewardsForRound, unclaimedRewards } from "@/lib/rewards"
import { ProjectWithDetails, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

const ROUND_ID = "5"

export const Sidebar = ({
  className,
  user,
  userProjects,
}: {
  className?: string
  user?: UserWithAddresses | null
  userProjects?: ProjectWithDetails[] | null
}) => {
  const { data: projects } = useGetRandomProjects()


  const classes: { [key: number]: string } = {
    0: "rounded-md absolute top-1/2 transform -translate-y-1/2 left-3 m-auto w-7 h-7 z-20",
    1: "rounded-md absolute inset-0 m-auto w-12 h-12 z-30 transform -translate-x-12",
    2: "absolute rounded-md top-0 bottom-0 left-0 right-0 m-auto z-40",
    3: "rounded-md absolute inset-0 m-auto w-12 h-12 z-30 transform translate-x-12",
    4: "rounded-md absolute right-3 top-1/2 transform -translate-y-1/2 m-auto w-7 h-7 z-20",
  }

  const [showNoRewards, setShowNoRewards] = useState(false)
  const [unclaimedReward, setUnclaimedReward] = useState<any | null>(null)

  useEffect(() => {
    if (!userProjects) return
    // User has submitted at least one application but didn't receive any rewards
    if (
      userProjects.find((project) => project.applications.length > 1) &&
      noRewardsForRound(userProjects, ROUND_ID)
    ) {
      setShowNoRewards(true)
      return
    }

    if (userProjects.find((project) => unclaimedRewards(project).length)) {
      const unclaimedReward = userProjects
        .map((project) => project.rewards)
        .flat()
        .find((reward) => !reward.claim || reward.claim.status !== "claimed")!
      setUnclaimedReward(unclaimedReward)
    }
  }, [userProjects])

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      {/* Explore projects */}
      <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-secondary bg-secondary rounded-xl">
        <div className="relative flex justify-center items-center py-4 w-full h-20">
          {projects?.map((item, index) => (
            <Image
              key={item.id}
              alt={item.name}
              src={item.thumbnailUrl || ""}
              width={28 + index * 20} // Adjusting size based on index
              height={28 + index * 20} // Adjusting size based on index
              className={classes[index]}
            />
          ))}
        </div>

        <p className="text-sm font-normal text-secondary-foreground text-center">
          Explore the projects that have received Retro Funding
        </p>
        <Link className="w-full" href="/round/results?rounds=7,8">
          <Button
            variant="outline"
            className="text-sm font-normal text-foreground justify-center mt-1 w-full"
          >
            View recipients
          </Button>
        </Link>
      </div>

      {/* Retro funding rewarded to optimism coolective */}
      <div className="flex flex-col items-center gap-y-3 p-6">
        <div className="w-52 h-[84px] relative">
          <Image
            alt="empty profile"
            fill
            src="/assets/images/sunnies-group.png"
          />
        </div>
        <p className="text-sm font-normal text-text-default text-center">
          60,815,042 OP
        </p>
        <p className="text-sm font-normal text-secondary-foreground text-center">
          Retro Funding rewarded to Optimism Collective contributors since 2022
        </p>
      </div>
    </div>
  )
}

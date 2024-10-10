"use client"

import { Project } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { updateInteractions } from "@/lib/actions/users"
import { noRewardsForRound, unclaimedRewards } from "@/lib/rewards"
import { ProjectWithDetails, UserWithAddresses } from "@/lib/types"
import {
  APPLICATIONS_CLOSED,
  clickSignInWithFarcasterButton,
} from "@/lib/utils"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

const ROUND_ID = "5"

export const Sidebar = ({
  className,
  projects,
  user,
  userProjects,
}: {
  className?: string
  projects: Project[]
  user?: UserWithAddresses | null
  userProjects?: ProjectWithDetails[] | null
}) => {
  const { status, data } = useSession()
  const router = useRouter()

  const onClickGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else {
      clickSignInWithFarcasterButton()
    }
  }

  const classes: { [key: number]: string } = {
    0: "rounded-md absolute top-1/2 transform -translate-y-1/2 left-3 m-auto w-7 h-7 z-20",
    1: "rounded-md absolute inset-0 m-auto w-12 h-12 z-30 transform -translate-x-12",
    2: "absolute rounded-md top-0 bottom-0 left-0 right-0 m-auto z-40",
    3: "rounded-md absolute inset-0 m-auto w-12 h-12 z-30 transform translate-x-12",
    4: "rounded-md absolute right-3 top-1/2 transform -translate-y-1/2 m-auto w-7 h-7 z-20",
  }

  const handleViewProfileClicked = () => {
    if (user) {
      updateInteractions({ userId: user?.id, viewProfileClicked: true })
    }
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
      {/* Your project not received card */}
      {showNoRewards && (
        <div className="flex flex-col items-center gap-y-3 p-6 border border-[#E0E2EB] bg-[#FBFCFE] rounded-xl">
          <Image
            alt="empty profile"
            src="/assets/images/big-sunny.png"
            width={76}
            height={76}
          />

          <p className="text-sm font-medium text-foreground text-center">
            Your project did not receive rewards in Round 5
          </p>
          <Link className="w-full" href="/profile/details">
            <Button
              onClick={handleViewProfileClicked}
              variant="outline"
              className="text-sm font-medium text-foreground justify-center  w-full"
            >
              View profile
            </Button>
          </Link>
        </div>
      )}

      {/* Your project not received card */}
      {!!unclaimedReward && (
        <div className="flex flex-col items-center gap-y-3 p-6 border border-red-200 bg-red-100 rounded-xl">
          <Image
            alt="empty profile"
            src="/assets/images/big-sunny.png"
            width={76}
            height={76}
          />
          <p className="text-sm font-medium text-foreground text-center">
            Congratulations!
          </p>
          <p className="text-sm text-secondary-foreground text-center">
            Your project received rewards in Round 5: OP Stack
          </p>
          <Link className="w-full" href={`/rewards/${unclaimedReward.id}`}>
            <Button
              type="button"
              variant="destructive"
              className="text-sm font-medium text-white justify-center w-full"
            >
              Claim rewards
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome too retro funding app */}
      {status === "unauthenticated" && (
        <div className="flex flex-col items-center gap-y-3 p-6 border border-[#D6E4FF] bg-[#F0F4FF] rounded-xl">
          <div className="w-52 h-[84px] relative">
            <Image
              alt="empty profile"
              fill
              src="/assets/images/sunnies-group.png"
            />
          </div>

          <p className="text-sm font-medium text-foreground text-center">
            Welcome to the new Retro Funding app
          </p>
          <p className="text-sm font-normal text-secondary-foreground text-center">
            Whether you’re a builder or a badgeholder, sign up.
          </p>

          <Button
            onClick={onClickGetStarted}
            variant="outline"
            className="text-sm font-medium text-foreground justify-center mt-1 w-full"
          >
            <Image
              src="/assets/icons/farcaster-icon.svg"
              height={12.23}
              width={13.33}
              alt="farcaster"
              className="mr-[10px]"
            />
            Sign up
          </Button>
        </div>
      )}

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
        <Link className="w-full" href="/round/results">
          <Button
            variant="outline"
            className="text-sm font-medium text-foreground justify-center mt-1 w-full"
          >
            View recipients
          </Button>
        </Link>
      </div>

      {/* Retro funding rewarded to optimism coolective */}
      <div className="flex flex-col items-center gap-y-3 p-6 border border-secondary bg-secondary rounded-xl">
        <p className="text-sm font-medium text-text-default text-center">
          60,815,042 OP
        </p>
        <p className="text-sm font-normal text-secondary-foreground text-center">
          Retro Funding rewarded to Optimism Collective contributors since 2022
        </p>
      </div>
    </div>
  )
}

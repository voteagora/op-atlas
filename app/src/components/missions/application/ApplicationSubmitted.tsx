"use client"

import { format } from "date-fns"
import { ArrowDownToLine } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useLayoutEffect, useState } from "react"
import Confetti from "react-dom-confetti"

import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../../ExternalLink"
import {
  Discord,
  DiscussionForum,
  Optimism,
  XOptimism,
} from "../../icons/socials"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { useRouter } from "next/navigation"
import { Application } from "@prisma/client"
import { GreenBadge } from "../common/badges/GreenBadge"

const SOCIALS = [
  {
    name: "Discord",
    icon: <Discord />,
    link: "https://discord.com/channels/667044843901681675/972069216343715860",
  },
  {
    name: "Gov Forum",
    icon: <DiscussionForum />,
    link: "https://gov.optimism.io/c/retrofunding/46",
  },
  {
    name: "@optimism",
    icon: <Optimism />,
    link: "https://warpcast.com/optimism",
  },
  {
    name: "@optimism",
    icon: <XOptimism />,
    link: "https://twitter.com/Optimism",
  },
] as const

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
}

export const ApplicationSubmitted = ({
  className,
  application,
  submittedProjects,
  roundName,
  onClose,
}: {
  className?: string
  application: Application
  submittedProjects: ProjectWithDetails[]
  roundName: string
  onClose?: () => void
}) => {
  const { data: session } = useSession()
  const [showConfetti, setShowConfetti] = useState(false)

  const router = useRouter()
  // Scroll to top on mount
  useLayoutEffect(() => {
    setShowConfetti(true)
    window.scrollTo(0, 0)
  }, [])

  const email = session?.user?.email

  const payoutTrackingPeriodStartDate = new Date()
  const payoutTrackingPeriodEndDate = new Date()
  const payoutStartDate = new Date()

  return (
    <div
      className={cn(
        "flex flex-col gap-y-12 w-full rounded-3xl p-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-y-6">
        <Confetti active={showConfetti} config={confettiConfig} />

        <Image
          alt="sunny"
          src="/assets/icons/sunny-smiling.png"
          height={124}
          width={124}
        />
        <h2 className="text-center">Application Submitted!</h2>
        <p className="text-center">
          Your application to{" "}
          {application ? (
            <>
              <span className="font-bold"> Retro Funding: {roundName}</span> was
              submitted on {format(application?.createdAt, "MMMM d")} at{" "}
              {format(application?.createdAt, "h:mm a")}. You&apos;ll receive a
              confirmation email at{" "}
              <span className="text-accent-foreground">{email}</span>.
            </>
          ) : (
            <></>
          )}
        </p>
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          className="w-fit mx-auto"
          type="button"
          variant="destructive"
        >
          View or edit your application
        </Button>
      )}

      <div className="flex flex-col">
        {submittedProjects.map((application, index) => {
          return (
            <div
              key={"Application" + index}
              className="flex justify-between items-center gap-y-6 p-5 bg-background border rounded-2xl"
            >
              <div className="flex items-center gap-4">
                {application.thumbnailUrl && (
                  <Image
                    alt="sunny"
                    src={application.thumbnailUrl}
                    height={48}
                    width={48}
                  />
                )}

                <p className="font-bold">{application.name}</p>
              </div>

              <GreenBadge />
            </div>
          )
        })}
      </div>

      {/* Expectations */}
      <div className="flex flex-col gap-y-6 text-center">
        <div>
          <h3 className="text-lg font-semibold">
            All projects are reviewed before earning rewards
          </h3>
          <p className="font-medium">
            Check your email for updates regarding your potential rewards.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            Rewards are paid out monthly
          </h3>
          <p className="font-medium">
            The next rewards tracking period is{" "}
            {format(payoutTrackingPeriodStartDate, "MMM, d")} -{" "}
            {format(payoutTrackingPeriodEndDate, "MMM, d")}, with payout
            starting {format(payoutStartDate, "MMM, d")}.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant={"destructive"}>Back to details</Button>

          <Button
            variant={"outline"}
            onClick={() => {
              router.push("/dashboard")
            }}
          >
            View dashboard
          </Button>
        </div>
      </div>

      {/* Social share */}
      <div className="flex flex-col justify-center items-center gap-y-6 p-10 bg-background border rounded-2xl ">
        <h3 className="text-xl font-semibold">Share with your community</h3>
        <div className="w-full h-[356px] relative">
          <Image
            src="/assets/images/round_6_success.png"
            fill
            alt="Social share"
          />
        </div>

        <div className="flex justify-center gap-x-2">
          <a
            href="https://warpcast.com/~/compose?text=I%20submitted%20for%20Retro%20Funding:%20Dev%20Tooling!"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-fit">
              <Optimism className="h-4 w-4 mr-2.5" />
              Cast to Warpcast
            </Button>
          </a>
          <a
            href="https://x.com/compose/post?text=I%20submitted%20for%20Retro%20Funding:%20Dev%20Tooling!"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="secondary" className="w-fit">
              <XOptimism className="h-4 w-4 mr-2.5" />
              Post on X
            </Button>
          </a>
          <a href="/assets/images/round_6_success.png" download>
            <Button variant="secondary" className="w-fit">
              Download image
              <ArrowDownToLine size={16} className="ml-2.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Join the conversation */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">Join the conversation</h3>
        <div className="grid grid-cols-4 gap-2">
          {SOCIALS.map(({ name, icon, link }, index) => (
            <ExternalLink
              href={link}
              key={index}
              className="flex flex-col items-center justify-center gap-y-2 h-[96px] w-[172px] rounded-xl cursor-pointer bg-secondary hover:opacity-80"
            >
              {icon}
              <p className="text-sm font-semibold">{name}</p>
            </ExternalLink>
          ))}
        </div>
      </div>
    </div>
  )
}

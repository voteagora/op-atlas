"use client"

import { format } from "date-fns"
import { ArrowDownToLine } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useLayoutEffect, useState } from "react"
import Confetti from "react-dom-confetti"

import { ApplicationWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { Discord, DiscussionForum, Optimism, XOptimism } from "../icons/socials"
import { Button } from "../ui/button"

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
    icon: <XOptimism />,
    link: "https://twitter.com/Optimism",
  },
  {
    name: "@optimism",
    icon: <Optimism />,
    link: "https://warpcast.com/optimism",
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
  onClose,
}: {
  className?: string
  application: ApplicationWithDetails
  onClose?: () => void
}) => {
  const { data: session } = useSession()
  const [showConfetti, setShowConfetti] = useState(false)

  // Scroll to top on mount
  useLayoutEffect(() => {
    setShowConfetti(true)
    window.scrollTo(0, 0)
  }, [])

  const email = session?.user?.email

  return (
    <div
      className={cn(
        "flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-y-6">
        <Confetti active={showConfetti} config={confettiConfig} />

        <Image
          alt="sunny"
          src="/assets/images/round-4-transparent.svg"
          height={124}
          width={124}
        />
        <h2 className="text-center">Application Submitted!</h2>
        <p className="text-center text-lg font-semibold">
          You&apos;ll receive an email{" "}
          {email ? (
            <>
              at <span className="text-accent-foreground">{email}</span>{" "}
            </>
          ) : (
            ""
          )}
          when your application is approved.
        </p>
        <p className="text-center">
          Your application to Retro Funding 6: Governance was submitted on{" "}
          {format(application.createdAt, "MMMM d, h:mm a")}. You can edit or
          resubmit with additional projects until October 10 at 19:00 UTC.
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

      {/* Expectations */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">What to expect</h3>

        <ul className="list-disc text-secondary-foreground space-y-4 pl-5">
          <li>
            <span className="font-medium">
              All applications are reviewed before approval:
            </span>{" "}
            Check your email for updates regarding your application status.
          </li>
          <li>
            <span className="font-medium"> Voting starts on Oct 28:</span>{" "}
            Badgeholders will evaluate the impact of your project(s).
          </li>
          <li>
            <span className="font-medium"> Results will be shared Nov 19:</span>{" "}
            If you receive rewards, you will get instructions on how to claim
            them via email.
          </li>
        </ul>
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
            href="https://warpcast.com/~/compose?text=I%20submitted%20for%20Retro%20Funding%20Round%206%20Governance"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-fit">
              <Optimism className="h-4 w-4 mr-2.5" />
              Cast to Warpcast
            </Button>
          </a>
          <a
            href="https://x.com/compose/post?text=I%20submitted%20for%20Retro%20Funding%20Round%206%20Governance"
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

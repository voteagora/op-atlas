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
import { ApplicationStatus } from "./ApplicationStatus"

const SOCIALS = [
  {
    name: "Discord",
    icon: <Discord />,
    link: "https://discord.com/invite/optimism",
  },
  {
    name: "Gov Forum",
    icon: <DiscussionForum />,
    link: "https://gov.optimism.io/",
  },
  {
    name: "@optimism",
    icon: <XOptimism />,
    link: "https://twitter.com/Optimism",
  },
  {
    name: "@optimism",
    icon: <Optimism />,
    link: "https://www.optimism.io/",
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
}: {
  className?: string
  application: ApplicationWithDetails
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
        <p className="text-center text-lg font-semibold max-w-lg">
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
      </div>

      <ApplicationStatus application={application} />

      {/* Expectations */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">What to expect</h3>

        <ul className="list-disc text-secondary-foreground space-y-4 pl-5">
          <li>
            <span className="font-medium">
              Your application is under review:
            </span>{" "}
            All applications are reviewed before approval. Check your email for
            updates regarding your application status.
          </li>
          <li>
            <span className="font-medium"> Voting starts on Sep 5:</span>{" "}
            Badgeholders will evaluate the impact of your project.
          </li>
          <li>
            <span className="font-medium"> Results will be shared Oct 3:</span>{" "}
            If you receive rewards, you will receive instructions on how to
            claim your Retro Funding rewards via email.
          </li>
        </ul>
      </div>

      {/* Social share */}
      <div className="flex flex-col justify-center items-center gap-y-6 p-10 bg-background border rounded-2xl ">
        <h3 className="text-xl font-semibold">Share with your community</h3>
        <div className="w-full h-[356px] relative">
          <Image
            src="/assets/images/submitted-retro-5-funding.png"
            fill
            alt="Social share"
          />
        </div>

        <a href="/assets/images/submitted-retro-5-funding.png" download>
          <Button variant="secondary" className="w-fit">
            Download image
            <ArrowDownToLine size={16} className="ml-2.5" />
          </Button>
        </a>
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

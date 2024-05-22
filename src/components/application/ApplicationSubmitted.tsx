import { Application } from "@prisma/client"
import { ArrowDownToLine } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLayoutEffect, useState } from "react"
import Confetti from "react-dom-confetti"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { Discord, DiscussionForum, Twitter } from "../icons/socials"
import { Button } from "../ui/button"
import { ApplicationStatus } from "./ApplicationStatus"

const SOCIALS = [
  {
    name: "Discord",
    icon: <Discord />,
    link: "https://discord.com/invite/optimism",
  },
  {
    name: "Twitter",
    icon: <Twitter />,
    link: "https://twitter.com/Optimism",
  },
  {
    name: "Governance Forum",
    icon: <DiscussionForum />,
    link: "https://gov.optimism.io/",
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
  application: Application
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
            <span className="font-medium">Voting starts on June 27:</span>{" "}
            Badgeholders will evaluate the impact of your project by voting on
            the quality-metrics that matter most to them. How voting works in
            this round:{" "}
            <Link
              href="https://app.optimism.io/retropgf"
              className="font-medium"
            >
              Learn more
            </Link>
          </li>
          <li>
            <span className="font-medium">Results will be shared July 18:</span>{" "}
            If you receive rewards, you will receive instructions on how to
            claim your Retro Funding rewards via email.
          </li>
        </ul>
      </div>

      {/* Social share */}
      <div className="flex flex-col gap-y-6">
        <h3>Share with your community</h3>
        <div className="w-full h-[400px] relative">
          <Image
            src="/assets/images/submitted-retro-funding.png"
            fill
            alt="Social share"
          />
        </div>

        <a href="/assets/images/submitted-retro-funding.png" download>
          <Button variant="secondary" className="w-fit">
            Download image
            <ArrowDownToLine size={16} className="ml-2.5" />
          </Button>
        </a>
      </div>

      {/* Join the conversation */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">Join the conversation</h3>
        <div className="grid grid-cols-3 gap-4">
          {SOCIALS.map(({ name, icon, link }) => (
            <ExternalLink
              href={link}
              key={name}
              className="flex flex-col items-center justify-center gap-y-2 h-[104px] border rounded-2xl cursor-pointer hover:opacity-80"
            >
              {icon}
              <p className="text-sm font-semibold">{name}</p>
            </ExternalLink>
          ))}
        </div>
      </div>

      <Link href="/dashboard">
        <Button variant="secondary" className="w-fit">
          Back to profile
        </Button>
      </Link>
    </div>
  )
}

import { ArrowDownToLine } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLayoutEffect } from "react"

import { cn } from "@/lib/utils"

import { Discord, DiscussionForum, Twitter } from "../icons/socials"
import { Button } from "../ui/button"
import { ApplicationStatus } from "./ApplicationStatus"

const SOCIALS = [
  {
    name: "Discord",
    icon: <Discord />,
  },
  {
    name: "Twitter",
    icon: <Twitter />,
  },
  {
    name: "Governance Forum",
    icon: <DiscussionForum />,
  },
] as const

export const ApplicationSubmitted = ({ className }: { className?: string }) => {
  const { data: session } = useSession()

  // Scroll to top on mount
  useLayoutEffect(() => {
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
        <Image
          alt="sunny"
          src="/assets/images/sunny-yay.png"
          height={80}
          width={90}
        />
        <h2 className="text-center">Application Submitted!</h2>
        <p className="text-center text-lg font-semibold max-w-lg">
          You&apos;ll receive an email{" "}
          {email ? (
            <>
              at{" "}
              <span className="text-accent-foreground">shaun@optimism.io</span>{" "}
            </>
          ) : (
            ""
          )}
          when your application is approved.
        </p>
      </div>

      <ApplicationStatus />

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
            <Link href="#" className="font-medium">
              Learn more
            </Link>
          </li>
          <li>
            <span className="font-medium">Results will be shared July 18:</span>{" "}
            You will receive instructions on how to claim your Retro Funding
            rewards via email.
          </li>
        </ul>
      </div>

      {/* Social share */}
      <div className="flex flex-col gap-y-6">
        <h3>Share with your community</h3>
        <div className="w-full h-[356px] rounded-xl bg-secondary" />

        <Button variant="secondary" className="w-fit">
          Download image
          <ArrowDownToLine size={16} className="ml-2.5" />
        </Button>
      </div>

      {/* Join the conversation */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">Join the conversation</h3>
        <div className="grid grid-cols-3 gap-4">
          {SOCIALS.map(({ name, icon }) => (
            <div
              key={name}
              className="flex flex-col items-center justify-center gap-y-2 h-[104px] border rounded-2xl"
            >
              {icon}
              <p className="text-sm font-semibold">{name}</p>
            </div>
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

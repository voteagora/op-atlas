"use client"

import Image from "next/image"
import { ArrowDownToLine } from "lucide-react"
import Link from "next/link"
import { useLayoutEffect } from "react"
import { cn } from "@/lib/utils"
import { ApplicationStatus } from "./ApplicationStatus"
import { Button } from "../ui/button"
import { Discord, DiscussionForum, Twitter } from "../icons/socials"

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
  // Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
        <h2 className="text-2xl font-semibold text-center">
          Application Submitted!
        </h2>
        <p className="text-center">
          You&apos;ll receive an email at{" "}
          <span className="font-medium text-muted-foreground">
            shaun@optimism.io
          </span>{" "}
          when your application is approved.
        </p>
      </div>

      <ApplicationStatus />

      {/* Expectations */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">What to expect</h3>

        <ul className="list-disc text-muted-foreground space-y-6 pl-5">
          <li>
            <span className="font-medium">
              Your application is under review:
            </span>{" "}
            All applications are reviewed before approval. Check your email for
            updates regarding your application status.
          </li>
          <li>
            <span className="font-medium">Voting starts on April 15:</span> At
            vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque.
          </li>
          <li>
            <span className="font-medium">Results will be shared May 31:</span>{" "}
            Similique sunt in culpa qui officia deserunt mollitia animi, id est
            laborum et dolorum fuga Aug 31.
          </li>
        </ul>

        <p className="text-muted-foreground">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque.
        </p>
      </div>

      {/* Social share */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">Share with your community</h3>
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

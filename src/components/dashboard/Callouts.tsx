import { ArrowRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"

export function BadgeholderCallout() {
  return (
    <ExternalLink
      href="https://optimism.deform.cc/season-6-citizen-opt-in/"
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/sunny-callout.png"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Calling all badgeholders! Confirm your citizenship for Governance
          Season 6
        </p>
        <div>Apply to vote by July 31.</div>
      </div>
      <ArrowRight size={24} />
    </ExternalLink>
  )
}

export function DeveloperCallout() {
  return (
    <ExternalLink
      href="https://optimism.deform.cc/guest-voter-application/"
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/sunny-callout.png"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Calling all developers! We need your vote in Retro Funding Round 5: OP
          Stack
        </p>
        <div>Apply to vote by July 31.</div>
      </div>
      <ArrowRight size={24} />
    </ExternalLink>
  )
}

export function SurveyCallout({ projectId }: { projectId?: string }) {
  const link = `https://optimismfnd.typeform.com/to/wTJYUOSd${
    projectId ? `#projectid=${projectId}` : ""
  }`

  return (
    <ExternalLink
      href={link}
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/sunny-callout-purple.png"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">Make Retro Funding better!</p>
        <div>Help us improve future rounds by taking a 4 minute survey.</div>
      </div>
      <ArrowUpRight size={20} />
    </ExternalLink>
  )
}
export function FundingRoundAnnouncementCallout() {
  return (
    <Link
      href="/application/5"
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/sunny-callout.png"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Now taking applications for Retro Funding Round 5: OP Stack
        </p>
        <div>Learn about the round, then apply by Sep 5.</div>
      </div>
      <ArrowRight size={20} />
    </Link>
  )
}

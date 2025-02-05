import { format } from "date-fns"
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Callout } from "../common/Callout"
import ExternalLink from "../ExternalLink"

export function NoRewardsCallout({
  roundName,
  rewardPeriodStart,
  rewardPeriodEnd,
}: {
  roundName: string
  rewardPeriodStart: Date
  rewardPeriodEnd: Date
}) {
  return (
    <Callout
      type="plain"
      showIcon={false}
      className="mt-10 py-2 bg-white border border-outline"
      leftAlignedContent={
        <div className="flex gap-4 items-center">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-red.svg"}
            width={10}
            height={10}
            className="w-12 h-12"
          />

          <div>
            <p className="font-bold">
              {"You didn't receive rewards in Retro Funding: " + roundName}
            </p>
            <p>
              {"Rewards for " +
                format(rewardPeriodStart, "MMM d") +
                " - " +
                format(rewardPeriodEnd, "MMM d")}
            </p>
          </div>
        </div>
      }
    />
  )
}

export function RewardsCallout({
  roundName,
  rewardPeriodStart,
  rewardPeriodEnd,
}: {
  roundName: string
  rewardPeriodStart: Date
  rewardPeriodEnd: Date
}) {
  return (
    <Callout
      type="optimism"
      showIcon={false}
      className="mt-10 py-2"
      leftAlignedContent={
        <div className="flex gap-4 items-center">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-white.svg"}
            width={10}
            height={10}
            className="w-12 h-12"
          />

          <div>
            <p className="font-bold">
              {"Congratulations! You received rewards in Retro Funding: " +
                roundName}
            </p>
            <p>
              {"Rewards for " +
                format(rewardPeriodStart, "MMM d") +
                " - " +
                format(rewardPeriodEnd, "MMM d")}
            </p>
          </div>
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
          <ChevronRight width={16} height={16} />
        </div>
      }
    />
  )
}

export function GovCandidateCallout() {
  return (
    <ExternalLink
      href="https://gov.optimism.io/t/season-7-elections-information/9392#p-42386-for-candidates-1"
      className={cn(
        "bg-calloutAlternative-foreground flex flex-col gap-y-6 mt-6 w-full max-w-4xl rounded-lg p-6",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Image
            src={"/assets/icons/vial-icon.svg"}
            width={56}
            height={56}
            alt="Vial"
          />
          <div className="flex flex-col mt-1">
            <p className="text-blue-800 font-bold">
              Are you a governance candidate?
            </p>
            <p className="text-blue-800">
              Check out Season 7 elections information
            </p>
          </div>
        </div>

        <div className="w-6 h-6 flex items-center justify-center">
          <Image
            src="/assets/icons/arrow-up-right.svg"
            width={12}
            height={12}
            alt="External link"
          />
        </div>
      </div>
    </ExternalLink>
  )
}

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
          Calling all developers! We need your vote in Retro Funding 5: OP Stack
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
      href="/application/6"
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/images/round-6-transparent.svg"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Now taking applications for Round 6: Governance
        </p>
        <div>Apply by Oct 14th.</div>
      </div>
      <ArrowRight size={20} />
    </Link>
  )
}

export function UnclaimedRecipientCallout({ rewardId }: { rewardId: string }) {
  return (
    <Link
      href={`/rewards/${rewardId}`}
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-destructive text-white",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/sunny-white.svg"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Congratulations! Your project received rewards in round 6
        </p>
        <div>Claim your rewards.</div>
      </div>
      <ArrowRight size={20} />
    </Link>
  )
}

export function ApplicationSubmittedCallout() {
  return (
    <Link
      href="/application/6"
      className={cn(
        "flex items-center rounded-xl px-8 py-6 w-full",
        "bg-success text-success-foreground",
      )}
    >
      <Image
        alt="Info"
        src="/assets/icons/celebration-sunny.svg"
        width={48}
        height={48}
      />
      <div className="ml-4 mr-5 flex-1">
        <p className="font-medium">
          Your application was submitted to Retro Funding 6: Governance
        </p>
        <div>
          You can edit or resubmit with additional projects until Oct 14th at
          18:00 UTC.
        </div>
      </div>
      <ArrowRight size={20} />
    </Link>
  )
}

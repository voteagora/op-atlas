import Link from "next/link"

import { InformationFill, Question } from "../icons/remix"

export const YouAreNotAdminCallout = () => {
  return (
    <div className="flex flex-row gap-2 items-center w-full text-red-600 bg-red-200 px-3 py-2 rounded-lg">
      <InformationFill className="w-5 h-5" fill="#B80018" />
      <div className="font-medium text-sm">
        You are not an admin of this project and cannot claim this grant.
      </div>
    </div>
  )
}

export const CantClaimCallout = ({ projectId }: { projectId: string }) => {
  return (
    <div className="flex flex-row gap-2 items-center w-full text-red-600 bg-red-200 px-3 py-2.5 rounded-lg">
      <InformationFill className="w-5 h-5" fill="#B80018" />
      <div className="font-medium text-sm">
        You can&apos;t claim your tokens until you&apos;ve completed KYC for
        your{" "}
        <Link
          href={`/projects/${projectId}/grant-address`}
          className="underline"
        >
          grant delivery address
        </Link>
        .
      </div>
    </div>
  )
}

export const UnclaimedRewardsCallout = () => {
  return (
    <div className="flex flex-row gap-2 items-center w-full text-callout-foreground bg-callout px-3 py-2.5 rounded-lg">
      <InformationFill className="w-5 h-5" fill="#0E4CAF" />
      <div className="font-medium text-sm">
        A link to claim this grant has been sent to your email.
      </div>
    </div>
  )
}

export const ScheduleClaimCallout = () => {
  return (
    <div className="flex flex-row gap-2 items-center w-full text-callout-foreground bg-callout px-3 py-2.5 rounded-lg">
      <InformationFill className="w-5 h-5" fill="#0E4CAF" />
      <div className="font-medium text-sm">
        Optimism only releases tokens to Superfluid after the 7th and 22nd day
        of the month. Check in later to claim your tokens.
      </div>
    </div>
  )
}

export const StreamingHelpCallout = () => {
  return (
    <div className="flex flex-row gap-2 items-center w-full text-secondary-foreground">
      <Question className="w-5 h-5" fill="#404454" />
      <div className="text-sm">
        Need help with Superfluid? You&apos;ll find a step by step guide to
        claiming your grant{" "}
        <Link
          href="https://intercom.help/superfluid/en/articles/10007044-how-to-view-and-claim-your-rf-grant"
          target="_blank"
          className="underline"
        >
          here
        </Link>
        .
      </div>
    </div>
  )
}

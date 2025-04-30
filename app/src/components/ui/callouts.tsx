import { format } from "date-fns"
import Link from "next/link"

import { getCutoffDate } from "@/lib/utils"

export const YouAreNotAdminCallout = () => {
  return (
    <div className="mt-2 px-3 py-2.5 rounded-md  text-red-600 bg-red-200">
      <span className="text-sm">
        You are not an admin of this project and cannot claim this grant.
      </span>
    </div>
  )
}

export const CantClaimCallout = ({ projectId }: { projectId: string }) => {
  return (
    <div className="mt-2 px-3 py-2.5 rounded-md text-red-600 bg-red-200">
      <span className="text-sm">
        You can’t claim your tokens until you’ve completed KYC for your{" "}
        <Link
          href={`/projects/${projectId}/grant-address`}
          className="underline"
        >
          grant delivery address
        </Link>
        .
      </span>
    </div>
  )
}

export const ScheduleClaimCallout = () => {
  const getReleaseDate = () => {
    const releaseDate = getCutoffDate()
    return format(releaseDate, "MMMM d, yyyy")
  }

  return (
    <div className="mt-2 px-3 py-2.5 rounded-md text-callout-foreground bg-callout">
      <span className="text-sm">
        Optimism only releases tokens to Superfluid once per month. Yours will
        be available to claim on or after {getReleaseDate()}.
      </span>
    </div>
  )
}

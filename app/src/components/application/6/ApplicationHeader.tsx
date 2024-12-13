import { format } from "date-fns"
import Image from "next/image"
import React from "react"

import { ApplicationWithDetails } from "@/lib/types"

interface ApplicationHeaderProps {
  hasApplied: boolean
  applications: ApplicationWithDetails[]
}

const ApplicationHeader = ({
  applications,
  hasApplied,
}: ApplicationHeaderProps) => {
  return (
    <div className="flex flex-col gap-y-6 items-center">
      <Image
        alt="sunny"
        src="/assets/images/round-6-transparent.svg"
        height={120}
        width={120}
      />
      <h2 className="text-center">Apply for Retro Funding 6: Governance</h2>
      {hasApplied ? (
        <div className="flex justify-between items-center gap-2 p-4 bg-success rounded-xl w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16}
              width={16}
              alt="Submitted"
            />
            <div className="flex flex-col text-success-foreground">
              <p className="font-medium text-sm">
                You submitted this application on{" "}
                {format(applications[0].createdAt, "MMMM d, h:mm a")}. You can
                edit or resubmit with additional projects until Oct 14th at
                19:00 UTC.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-secondary-foreground">
          Submit this application by Oct 14th, 2024 at 19:00 UTC
        </p>
      )}
    </div>
  )
}

export default ApplicationHeader

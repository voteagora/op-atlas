import { Application } from "@prisma/client"
import { format } from "date-fns"
import Image from "next/image"
import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { Badge } from "@/components/ui/badge"
import { EAS_URL_PREFIX } from "@/lib/utils"

interface ApplicationHeaderProps {
  hasApplied: boolean
  applications: Application[]
}

const ApplicationHeader = ({
  applications,
  hasApplied,
}: ApplicationHeaderProps) => {
  return (
    <div className="flex flex-col items-center">
      <Image
        alt="sunny"
        src="/assets/images/round-5-transparent.svg"
        height={120}
        width={120}
      />
      <h2 className="text-center">Apply for Retro Funding Round 5: OP Stack</h2>
      {hasApplied ? (
        <div className="flex justify-between items-center mt-6 gap-2 p-4 bg-success rounded-xl w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16}
              width={16}
              alt="Submitted"
            />
            <div className="flex flex-col text-success-foreground">
              <p className="font-medium text-sm">
                Application submitted on{" "}
                {format(applications[0].createdAt, "MMMM d, h:mm a")}
              </p>
            </div>
          </div>
          <ExternalLink
            className="text-sm text-success-foreground font-medium"
            href={`${EAS_URL_PREFIX}${applications[0].attestationId}`}
          >
            View attestation
          </ExternalLink>
        </div>
      ) : (
        <p className="text-secondary-foreground">
          Submit this application by Aug 1 at 19:00 UTC
        </p>
      )}
    </div>
  )
}

export default ApplicationHeader

import { format } from "date-fns"
import Image from "next/image"

import { ApplicationWithDetails } from "@/lib/types"
import { EAS_URL_PREFIX } from "@/lib/utils"

import ExternalLink from "../ExternalLink"

export const ApplicationStatus = ({
  application,
}: {
  className?: string
  application: ApplicationWithDetails
}) => {
  return (
    <div className="flex justify-between items-center gap-2 p-4 bg-success rounded-md w-full">
      <div className="flex items-center gap-2">
        <Image
          src="/assets/icons/circle-check-green.svg"
          height={16}
          width={16}
          alt="Submitted"
        />
        <div className="flex flex-col text-success-foreground max-w-md">
          <p className="font-medium text-sm">
            Your application was submitted on{" "}
            {format(application.createdAt, "MMM d, h:mm a")}
            <br /> You can resubmit with additional projects until Sep 5 at
            19:00 UTC
          </p>
        </div>
      </div>
      <ExternalLink
        className="text-sm text-success-foreground font-medium"
        href={`${EAS_URL_PREFIX}${application.attestationId}`}
      >
        View attestation
      </ExternalLink>
    </div>
  )
}

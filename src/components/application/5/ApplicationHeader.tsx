import { format } from "date-fns"
import { ArrowDownToLine } from "lucide-react"
import Image from "next/image"
import React from "react"

import ExternalLink from "@/components/ExternalLink"
import { ApplicationWithDetails } from "@/lib/types"
import { EAS_URL_PREFIX } from "@/lib/utils"

interface ApplicationHeaderProps {
  hasApplied: boolean
  applications: ApplicationWithDetails[]
}

const ApplicationHeader = ({
  applications,
  hasApplied,
}: ApplicationHeaderProps) => {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = "/assets/images/organization-create-graphic.png"
    link.download = "organization-create-graphic.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <div className="flex flex-col gap-y-6 items-center">
      <Image
        alt="sunny"
        src="/assets/images/round-5-transparent.svg"
        height={120}
        width={120}
      />
      <h2 className="text-center">Apply for Retro Funding Round 5: OP Stack</h2>
      {hasApplied ? (
        <div className="flex justify-between items-center gap-2 p-4 bg-success rounded-xl w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/circle-check-green.svg"
              height={16}
              width={16}
              alt="Submitted"
            />
            <div className="flex flex-col text-success-foreground max-w-[445px]">
              <p className="font-medium text-sm">
                Your application was submitted on{" "}
                {format(applications[0].createdAt, "MMMM d, h:mm a")}. You can
                resubmit with additional projects until Sep 5 at 19:00 UTC
              </p>
              <ExternalLink
                href={`${EAS_URL_PREFIX}${applications[0].attestationId}`}
                className="text-sm font-medium mt-2"
              >
                View attestation
              </ExternalLink>
            </div>
          </div>
          <div className="flex justify-center items-center gap-x-6">
            <Image
              alt="sunny"
              src="/assets/images/submitted-retro-5-funding.png"
              height={80}
              width={143}
            />
            <ArrowDownToLine
              onClick={handleDownload}
              size={11}
              className="text-success-foreground cursor-pointer"
            />
          </div>
        </div>
      ) : (
        <p className="text-secondary-foreground">
          Submit this application by Sep 5 at 19:00 UTC
        </p>
      )}
    </div>
  )
}

export default ApplicationHeader

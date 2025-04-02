import { ChevronRight } from "lucide-react"
import Image from "next/image"

import { Callout } from "@/components/common/Callout"
import ExtendedLink from "@/components/common/ExtendedLink"
import TrackedLink from "@/components/common/TrackedLink"
import { ApplicationWithDetails } from "@/lib/types"

export function EnrolledCallout({
  application,
  index,
}: {
  application: ApplicationWithDetails
  index: number
}) {
  return (
    <Callout
      type="success"
      showIcon={false}
      leftAlignedContent={
        <div className="flex">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-smiling.png"}
            width={20}
            height={20}
          />
          <ExtendedLink
            href={`/project/${application.projectId}`}
            className="text-sm font-medium mr-5 ml-2"
            text={`Enrolled in Retro Funding: ` + application?.round.name}
          />
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
          {/* <ExternalLink
            className="flex items-center text-sm text-success-foreground font-medium"
            href={`${EAS_URL_PREFIX}${application.attestationId}`}
          >
            Confirmation
            <ChevronRight width={16} height={16} />
          </ExternalLink> */}
          <TrackedLink
            className="flex items-center text-sm text-success-foreground font-medium"
            href={`/project/${application.projectId}`}
            eventName="Link Click"
            eventData={{
              source: "Dashboard",
              linkName: "Rewards",
              projectId: application.projectId,
            }}
          >
            Rewards
            <ChevronRight width={16} height={16} />
          </TrackedLink>
        </div>
      }
    />
  )
}

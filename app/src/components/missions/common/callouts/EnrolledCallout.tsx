import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import ExternalLink from "@/components/ExternalLink"
import { useUserApplications } from "@/hooks/db/useUserApplications"
import { MISSIONS } from "@/lib/MissionsAndRoundData"
import { ApplicationWithDetails } from "@/lib/types"
import { EAS_URL_PREFIX } from "@/lib/utils"

import { Callout } from "../../../common/Callout"

export function EnrolledCallout({
  application,
  index,
  onRewardsClick,
}: {
  application: ApplicationWithDetails
  index: number
  onRewardsClick: () => void
}) {
  const router = useRouter()

  const round = MISSIONS.find(
    (round) => round.number.toString() === application.roundId,
  )

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
          <button
            onClick={() => {
              router.push(`/missions/${round?.pageName}`)
            }}
            className="text-sm font-medium mr-5 ml-2"
          >
            {`Enrolled in Retro Funding: ` + application?.round.name}
          </button>
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
          <button
            className="flex items-center text-sm text-success-foreground font-medium"
            onClick={onRewardsClick}
          >
            Rewards
            <ChevronRight width={16} height={16} />
          </button>
        </div>
      }
    />
  )
}

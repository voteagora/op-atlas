import ExternalLink from "../../ExternalLink"
import { VideoCallout } from "../common/callouts/VideoCallout"
import { DocumentCallout } from "../common/callouts/DocumentCallout"
import { useMissionFromPath } from "@/hooks/useMissionFromPath"
export const Eligibility = () => {
  const mission = useMissionFromPath()

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold">Eligibility</p>
      <p>
        {
          "In order to apply, your Dev Tooling project must first be added to OP Atlas. A project can't be considered for enrollment until its setup is complete."
        }
      </p>
      <VideoCallout
        text="How to add a project in OP Atlas"
        href="https://youtube.com"
      />

      {mission?.missionPageEligibility}
    </div>
  )
}

import BubbleLink from "@/components/common/BubbleLink"
import { OrganizationWithTeamAndProjects } from "@/lib/types"

export default function OrganizationHeaderLinks({
  organization,
}: {
  organization: OrganizationWithTeamAndProjects
}) {
  return (
    <div className="mt-2 mr-4 flex items-center gap-x-4">
      {/* Website */}
      {organization.website.map((website) => (
        <BubbleLink
          key={website}
          href={website}
          icon="/assets/icons/link-icon.svg"
          text={website}
          tooltipText="Website"
        />
      ))}

      {/* Farcaster */}
      {organization.farcaster.map((farcaster) => (
        <BubbleLink
          key={farcaster}
          href={`https://warpcast.com/${farcaster}`}
          icon="/assets/icons/farcaster-icon.svg"
          text={`@${farcaster}`}
          tooltipText="Farcaster"
        />
      ))}

      {/* X */}
      {organization.twitter && (
        <BubbleLink
          href={`https://x.com/${organization.twitter}`}
          icon="/assets/icons/x-icon.svg"
          text={organization.twitter}
          tooltipText="X (Twitter)"
        />
      )}
    </div>
  )
}


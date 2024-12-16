import BubbleLink from "@/components/common/BubbleLink"
import { UserWithAddresses } from "@/lib/types"

export default function ProfileHeaderLinks({
  user,
}: {
  user: UserWithAddresses
}) {
  return (
    <div className="mt-2 mr-4 flex items-center gap-x-4">
      {/* Farcaster */}
      <BubbleLink
        href={`https://warpcast.com/${user.username}`}
        icon="/assets/icons/farcaster-icon.svg"
        text={`@${user.username}`}
        tooltipText="Farcaster"
      />

      {/* X */}

      {/* Github */}
      {user.github && (
        <BubbleLink
          href={`https://github.com/${user.github}`}
          icon="/assets/icons/github-icon.svg"
          text={`@${user.github}`}
          tooltipText="Github"
        />
      )}

      {/* Agora */}

      {/* Discord */}
    </div>
  )
}

import { toast } from "sonner"

import { Badge } from "@/components/common/Badge"
import BubbleLink from "@/components/common/BubbleLink"
import useDelegateData from "@/hooks/api/useDelegateData"
import { useFarcasterUserData } from "@/hooks/api/useFarcasterUserData"
import { useGithubUserData } from "@/hooks/api/useGithubUserData"
import { UserWithAddresses } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

export default function ProfileHeaderLinks({
  user,
}: {
  user: UserWithAddresses
}) {
  const { delegate } = useDelegateData(user.addresses.map((a) => a.address))

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const { user: farcasterUsers } = useFarcasterUserData(user.farcasterId)
  const { user: githubUserData } = useGithubUserData(user.github || "")

  const onDiscordBadgeClick = () => {
    if (!user.discord) return

    navigator.clipboard.writeText(user.discord)
    toast.success("Discord username copied")
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Farcaster */}
      <BubbleLink
        href={`https://warpcast.com/${user.username}`}
        icon="/assets/icons/farcaster-icon.svg"
        text={
          <div className="flex gap-1">
            <span className="text-sm text-black">@{user.username}</span>
            {farcasterUsers?.users[0]?.follower_count && (
              <>
                <span className="text-sm text-gray-500 font-light">
                  {formatNumber(farcasterUsers?.users[0]?.follower_count)}
                </span>
                <span className="text-sm text-gray-500 font-light">
                  Followers
                </span>
              </>
            )}
          </div>
        }
        tooltipText="Farcaster"
      />

      {/* X */}

      {/* Github */}
      {user.github && (
        <BubbleLink
          href={`https://github.com/${user.github}`}
          icon="/assets/icons/github-icon.svg"
          text={
            <div className="flex gap-1">
              <span className="text-sm text-black">@{user.github}</span>
              {githubUserData?.followers && (
                <>
                  <span className="text-sm text-gray-500 font-light">
                    {formatNumber(githubUserData?.followers)}
                  </span>
                  <span className="text-sm text-gray-500 font-light">
                    Followers
                  </span>
                </>
              )}
            </div>
          }
          tooltipText="Github"
        />
      )}

      {/* Discord */}
      {user.discord && (
        <Badge
          as="button"
          leftIcon="/assets/icons/discordIcon.svg"
          text={
            <div className="flex gap-1">
              <span className="text-sm text-black">@{user.discord}</span>
            </div>
          }
          tooltipText="Click to copy Discord Username"
          onClick={onDiscordBadgeClick}
        />
      )}

      {/* Agora */}
      {delegate && Number(delegate.votingPower.total) > 0 && (
        <BubbleLink
          href={`https://vote.optimism.io/delegates/${delegate.address}`}
          icon="/assets/icons/agora-icon.svg"
          text={
            <span>
              <span className="text-sm text-black">
                {truncateAddress(delegate.address)}{" "}
              </span>
              <span className="text-gray-500 font-light">
                {new Intl.NumberFormat("en", { notation: "compact" }).format(
                  Number(delegate.numOfDelegators),
                )}{" "}
                Delegators
              </span>
            </span>
          }
          tooltipText="Optimism Agora"
        />
      )}

      {/* Discord */}

      {/* Gov Forum */}
      {user.govForumProfileUrl && (
        <BubbleLink
          href={user.govForumProfileUrl}
          icon="/assets/icons/op-icon-black.svg"
          text={
            <span className="text-sm text-black">
              @{user.govForumProfileUrl.split("/u/")[1].split("/summary")[0]}
            </span>
          }
          tooltipText="Optimism Collective Governance Forum"
        />
      )}
    </div>
  )
}

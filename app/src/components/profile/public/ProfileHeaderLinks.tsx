import { toast } from "sonner"

import { Badge } from "@/components/common/Badge"
import BubbleLink from "@/components/common/BubbleLink"
import useDelegateData from "@/hooks/api/useDelegateData"
import { useFarcasterUserData } from "@/hooks/api/useFarcasterUserData"
import { useGithubUserData } from "@/hooks/api/useGithubUserData"
import { UserWithAddresses } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import Image from "next/image"

export default function ProfileHeaderLinks({
  user,
}: {
  user: UserWithAddresses
}) {
  // const { delegate } = useDelegateData(user?.addresses?.map((a) => a.address))
  // TODO: remove this once we have a delegate for the user
  const { delegate } = useDelegateData(['0x7fc80fad32ec41fd5cfcc14eee9c31953b6b4a8b'])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const { user: farcasterUsers } = useFarcasterUserData(user?.farcasterId, !!user?.farcasterId)
  const { user: githubUserData } = useGithubUserData(user.github || "")

  const onDiscordBadgeClick = () => {
    if (!user.discord) return

    navigator.clipboard.writeText(user.discord)
    toast.success("Discord username copied")
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Farcaster */}
      {user.farcasterId &&
        <SocialLink
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
        />
      }

      {/* X */}

      {/* Github */}
      {user.github && (
        <SocialLink
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
        />
      )}

      {/* Discord */}
      {user.discord && (
        <SocialLink
          href={`https://discord.com/users/${user.discord}`}
          icon="/assets/icons/discordIcon.svg"
          text={
            <div className="flex gap-1">
              <span className="text-sm text-black">@{user.discord}</span>
            </div>
          }

        />
      )}

      {/* Agora */}
      {delegate && Number(delegate.votingPower.total) > 0 && (
        <SocialLink
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
        />
      )}



      {/* Gov Forum */}
      {user.govForumProfileUrl && (
        <SocialLink
          href={user.govForumProfileUrl}
          icon="/assets/icons/op-icon-black.svg"
          text={
            <span className="text-sm text-black">
              @{user.govForumProfileUrl.split("/u/")[1].split("/summary")[0]}
            </span>
          }

        />
      )}
    </div>
  )
}


function SocialLink({ href, icon, text, tooltipText }: { href: string, icon: string, text: React.ReactNode, tooltipText?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-row gap-2"
      title={tooltipText}
    >
      <Image src={icon} width={14} height={13} alt={tooltipText || "Social link"} />
      <div className="text-sm text-secondary-foreground">{text}</div>
    </a>
  )
}
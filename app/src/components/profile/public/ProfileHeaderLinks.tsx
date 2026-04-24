import { CheckboxCircleFIll } from "@/components/icons/remix"
import {
  Agora,
  Discord,
  Farcaster,
  Github,
  Optimism,
  World,
  XOptimism,
} from "@/components/icons/socials"
import useDelegateData from "@/hooks/api/useDelegateData"
import { useFarcasterUserData } from "@/hooks/api/useFarcasterUserData"
import { useGithubUserData } from "@/hooks/api/useGithubUserData"
import { useUserWorldIdVerified } from "@/hooks/db/useUserWorldId"
import type { UserProfilePublicDTO } from "@/lib/dto"
import { formatNumber } from "@/lib/utils"
import { truncateAddress } from "@/lib/utils/string"

import ProfileSidebarLink from "./ProfileSidebarLink"

export default function ProfileHeaderLinks({
  user,
}: {
  user: UserProfilePublicDTO
}) {
  const { delegate } = useDelegateData(user?.addresses?.map((a) => a.address))
  const { user: farcasterUsers } = useFarcasterUserData(
    user?.farcasterId,
    !!user?.farcasterId,
  )
  const { user: githubUserData } = useGithubUserData(user.github || "")
  const { data: worldId } = useUserWorldIdVerified({
    id: user.id,
    enabled: !!user.id,
  })

  return (
    <div className="flex flex-col">
      {/* Farcaster */}
      {user.farcasterId && (
        <ProfileSidebarLink
          href={`https://warpcast.com/${user.username}`}
          icon={<Farcaster className="w-[16px] h-[16px]" />}
          text={
            <div className="flex gap-2">
              <span className="text-sm text-black group-hover:underline">
                @{user.username}
              </span>
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
      )}

      {/* Github */}
      {user.github && (
        <ProfileSidebarLink
          href={`https://github.com/${user.github}`}
          icon={<Github className="w-[16px] h-[16px]" />}
          text={
            <div className="flex gap-2">
              <span className="text-sm text-black group-hover:underline">
                @{user.github}
              </span>
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
        <ProfileSidebarLink
          href={`https://discord.com/users/${user.discord}`}
          icon={<Discord className="w-[15px] h-[15px]" />}
          text={
            <div className="flex gap-2">
              <span className="text-sm text-black group-hover:underline">
                @{user.discord}
              </span>
            </div>
          }
        />
      )}

      {/* X */}
      {user.twitter && (
        <ProfileSidebarLink
          href={`https://x.com/${user.twitter}`}
          icon={<XOptimism className="w-[16px] h-[16px]" />}
          text={
            <div className="flex gap-2">
              <span className="text-sm text-black group-hover:underline">
                @{user.twitter}
              </span>
            </div>
          }
        />
      )}

      {/* Agora */}
      {delegate && Number(delegate.votingPower.total) > 0 && (
        <ProfileSidebarLink
          href={`https://vote.optimism.io/delegates/${delegate.address}`}
          icon={<Agora className="w-[15px] h-[15px]" />}
          text={
            <span>
              <span className="text-sm text-black group-hover:underline">
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
        <ProfileSidebarLink
          href={user.govForumProfileUrl}
          icon={<Optimism className="w-[16px] h-[16px]" fill="#FF0000" />}
          text={
            <span className="text-sm text-black group-hover:underline">
              @{user.govForumProfileUrl.split("/u/")[1].split("/summary")[0]}
            </span>
          }
        />
      )}
      {/* WorldID */}
      {worldId?.verified && (
        <div className="flex flex-row gap-2 items-center pl-[12px] h-8">
          <World className="w-[16px] h-[16px]" />
          <div className="flex items-center gap-1 text-sm text-secondary-foreground">
            <span className="text-black">WorldID</span>
            <CheckboxCircleFIll className="w-4 h-4" fill="#1DBA6A" />
          </div>
        </div>
      )}
    </div>
  )
}

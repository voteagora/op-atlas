import BubbleLink from "@/components/common/BubbleLink"
import useDelegateData from "@/hooks/api/useDelegateData"
import { UserWithAddresses } from "@/lib/types"

export default function ProfileHeaderLinks({
  user,
}: {
  user: UserWithAddresses
}) {
  const { delegate } = useDelegateData(user.addresses.map((a) => a.address))

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="mt-2 mr-4 flex items-center gap-x-2 pt-4">
      {/* Farcaster */}
      <BubbleLink
        href={`https://warpcast.com/${user.username}`}
        icon="/assets/icons/farcaster-icon.svg"
        text={<span className="text-sm text-black">@{user.username}</span>}
        tooltipText="Farcaster"
      />

      {/* X */}

      {/* Github */}
      {user.github && (
        <BubbleLink
          href={`https://github.com/${user.github}`}
          icon="/assets/icons/github-icon.svg"
          text={<span className="text-sm text-black">@{user.github}</span>}
          tooltipText="Github"
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

"use client"

import { UserAddress } from "@prisma/client"

import { Check, Close } from "@/components/icons/reminx"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

const LINK_STYLE = "inline-block cursor-pointer underline hover:no-underline"

export const ProjectRequirements = ({ userId }: { userId: string }) => {
  const { user } = useUser({ id: userId })
  const { linkEmail, updateEmail } = usePrivyEmail(userId)
  const { linkWallet } = usePrivyLinkWallet(userId)
  const { setOpenDialog } = useAppDialogs()

  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)

  const renderEmail = () => {
    if (email) {
      return (
        <ConditionRow isMet={true}>
          You&apos;ve added email in Atlas:{" "}
          <span className="font-semibold">{email.email}</span> |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => updateEmail()}
            onKeyDown={(e) => e.key === "Enter" && updateEmail()}
          >
            Edit
          </button>
        </ConditionRow>
      )
    }
    return (
      <ConditionRow isMet={false}>
        You&apos;ve added email in Atlas |{" "}
        <button
          type="button"
          className={LINK_STYLE}
          onClick={() => linkEmail()}
          onKeyDown={(e) => e.key === "Enter" && linkEmail()}
        >
          Add your email
        </button>
      </ConditionRow>
    )
  }

  const renderAddress = () => {
    const connectedAddress = user?.addresses?.[0]

    if (govAddress) {
      return (
        <ConditionRow isMet={true}>
          You&apos;ve added a governance address in Atlas:{" "}
          <span className="font-semibold">
            {truncateAddress(govAddress.address as string)}
          </span>{" "}
          |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => setOpenDialog("citizenship_governance_address")}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setOpenDialog("citizenship_governance_address")
            }
          >
            Edit
          </button>
        </ConditionRow>
      )
    }

    if (connectedAddress) {
      return (
        <ConditionRow isMet={false}>
          You&apos;ve added a governance address in Atlas |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => setOpenDialog("citizenship_governance_address")}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setOpenDialog("citizenship_governance_address")
            }
          >
            Set {truncateAddress(connectedAddress.address as string)}
          </button>{" "}
          as Governance Address
        </ConditionRow>
      )
    }

    return (
      <ConditionRow isMet={false}>
        You&apos;ve added a governance address in Atlas |{" "}
        <button
          type="button"
          className={LINK_STYLE}
          onClick={() => linkWallet()}
          onKeyDown={(e) => e.key === "Enter" && linkWallet()}
        >
          Add your address
        </button>
      </ConditionRow>
    )
  }

  const renderRevenue = () => {
    return (
      <ConditionRow isMet={false}>
        The project contributed to ≥0.5% of the surplus revenue contributed by
        onchain apps in the last Season, or was in the top 100.
      </ConditionRow>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="font-semibold text-xl">Requirements</div>
      <div>
        {renderRevenue()}
        {renderEmail()}
        {renderAddress()}
      </div>
    </div>
  )
}

const ConditionRow = ({
  children,
  isMet,
}: {
  children: React.ReactNode
  isMet: boolean
}) => {
  return (
    <div className="flex flex-row items-center gap-3">
      {isMet ? (
        <Check className="w-[20px] h-[20px]" fill="#0DA529" />
      ) : (
        <Close className="w-[20px] h-[20px]" fill="#BCBFCD" />
      )}
      <span>{children}</span>
    </div>
  )
}

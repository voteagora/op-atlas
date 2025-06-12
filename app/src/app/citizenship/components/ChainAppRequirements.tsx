"use client"

import { UserAddress } from "@prisma/client"

import { ConditionRow } from "@/app/citizenship/components/ConditionRow"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

const LINK_STYLE = "inline-block cursor-pointer underline"

export const ChainAppRequirements = ({
  userId,
  qualification,
}: {
  userId: string
  qualification: CitizenshipQualification
}) => {
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
            onClick={() => setOpenDialog("governance_address")}
            onKeyDown={(e) =>
              e.key === "Enter" && setOpenDialog("governance_address")
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
            onClick={() => setOpenDialog("governance_address")}
            onKeyDown={(e) =>
              e.key === "Enter" && setOpenDialog("governance_address")
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
          onClick={() => linkWallet({ primary: true })}
          onKeyDown={(e) => e.key === "Enter" && linkWallet({ primary: true })}
        >
          Add your address
        </button>
      </ConditionRow>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="font-semibold text-xl text-foreground">Requirements</div>
      <div className="flex flex-col gap-1 text-secondary-foreground">
        <ConditionRow isMet={true}>
          {qualification.type === CITIZEN_TYPES.chain
            ? "The organization accounted for at least 2% of the total revenue share contributed by all chains in the past Season, or was among the top 15 chains by revenue contribution in the past Season."
            : "The project was responsible for at least 0.5% of the total gas used across the Superchain over the past Season, or was among the top 100 apps by gas usage in the past Season."}
        </ConditionRow>
        {renderEmail()}
        {renderAddress()}
      </div>
    </div>
  )
}

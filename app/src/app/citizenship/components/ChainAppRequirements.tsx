"use client"

import { UserAddress } from "@prisma/client"
import { useSession } from "next-auth/react"

import { ConditionRow } from "@/app/citizenship/components/ConditionRow"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

const LINK_STYLE = "inline-block cursor-pointer underline"
type HookedUser = ReturnType<typeof useUser>["user"]

export const ChainAppRequirements = ({
  userId,
  qualification,
}: {
  userId: string
  qualification: CitizenshipQualification
}) => {
  const { data: session } = useSession()
  const impersonationMode = !!session?.impersonation?.isActive
  const { user } = useUser({ id: userId })

  if (impersonationMode) {
    return (
      <ReadOnlyChainRequirements user={user} qualification={qualification} />
    )
  }

  return (
    <InteractiveChainRequirements
      userId={userId}
      user={user}
      qualification={qualification}
    />
  )
}

const InteractiveChainRequirements = ({
  userId,
  user,
  qualification,
}: {
  userId: string
  user: HookedUser
  qualification: CitizenshipQualification
}) => {
  const { linkEmail, updateEmail } = usePrivyEmail(userId)
  const { linkWallet } = usePrivyLinkWallet(userId)
  const { setOpenDialog } = useAppDialogs()

  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)
  const connectedAddress = user?.addresses?.[0]

  const renderEmail = () => {
    if (email) {
      return (
        <ConditionRow isMet>
          You&apos;ve added email in Atlas:{" "}
          <span className="font-normal">{email.email}</span> |{" "}
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
    if (govAddress) {
      return (
        <ConditionRow isMet>
          You&apos;ve added a governance address in Atlas:{" "}
          <span className="font-normal">
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
          onKeyDown={(e) =>
            e.key === "Enter" && linkWallet({ primary: true })
          }
        >
          Add your address
        </button>
      </ConditionRow>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="font-normal text-xl text-foreground">Requirements</div>
      <div className="flex flex-col gap-1 text-secondary-foreground">
        <ConditionRow isMet>
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

const ReadOnlyChainRequirements = ({
  user,
  qualification,
}: {
  user: HookedUser
  qualification: CitizenshipQualification
}) => {
  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <div className="font-normal text-xl text-foreground">
        Requirements (Read Only)
      </div>
      <ConditionRow isMet>
        {qualification.type === CITIZEN_TYPES.chain
          ? "The organization accounted for at least 2% of the total revenue share contributed by all chains in the past Season, or was among the top 15 chains by revenue contribution in the past Season."
          : "The project was responsible for at least 0.5% of the total gas used across the Superchain over the past Season, or was among the top 100 apps by gas usage in the past Season."}
      </ConditionRow>
      <ConditionRow isMet={!!email}>
        {email ? (
          <>
            You&apos;ve added email in Atlas:{" "}
            <span className="font-normal">{email.email}</span>
          </>
        ) : (
          <>You haven&apos;t added an email in Atlas.</>
        )}
      </ConditionRow>
      <ConditionRow isMet={!!govAddress}>
        {govAddress ? (
          <>
            Governance address:{" "}
            <span className="font-normal">
              {truncateAddress(govAddress.address as string)}
            </span>
          </>
        ) : (
          <>No governance address linked.</>
        )}
      </ConditionRow>
      <div className="text-xs text-muted-foreground">
        Profile updates are disabled while impersonating.
      </div>
    </div>
  )
}

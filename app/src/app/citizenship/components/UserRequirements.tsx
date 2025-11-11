"use client"

import { UserAddress, UserPassport } from "@prisma/client"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { ConditionRow } from "@/app/citizenship/components/ConditionRow"
import { WorldConnection } from "@/components/profile/WorldIdConnection"
import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"
import { useUserWorldId } from "@/hooks/db/useUserWorldId"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { useRefreshPassport } from "@/hooks/useRefreshPassport"
import { VALID_PASSPORT_THRESHOLD } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

const LINK_STYLE = "inline-block cursor-pointer underline"
type HookedUser = ReturnType<typeof useUser>["user"]

export const UserRequirements = ({
  userId,
  qualification,
}: {
  userId: string
  qualification: CitizenshipQualification | null
}) => {
  const { data: session } = useSession()
  const impersonationMode = !!session?.impersonation?.isActive
  const { user } = useUser({ id: userId })
  const { data: userPassports } = useUserPassports({ id: userId })
  const { data: userWorldId } = useUserWorldId({ id: userId })

  if (impersonationMode) {
    return (
      <ReadOnlyRequirements
        user={user}
        userPassports={userPassports}
        userWorldId={userWorldId}
      />
    )
  }

  return (
    <InteractiveRequirements
      userId={userId}
      user={user}
      userPassports={userPassports}
      userWorldId={userWorldId}
      qualification={qualification}
    />
  )
}

const InteractiveRequirements = ({
  userId,
  user,
  userPassports,
  userWorldId,
  qualification,
}: {
  userId: string
  user: HookedUser
  userPassports: UserPassport[] | undefined
  userWorldId:
    | ReturnType<typeof useUserWorldId>["data"]
    | undefined
  qualification: CitizenshipQualification | null
}) => {
  const { linkEmail, updateEmail } = usePrivyEmail(userId)
  const { refreshPassport } = useRefreshPassport(userId)
  const { linkWallet } = usePrivyLinkWallet(userId)
  const { linkGithub, unlinkGithub, toggleIsDeveloper } =
    usePrivyLinkGithub(userId)
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

  const renderGithub = () => {
    if (user?.github) {
      return (
        <ConditionRow isMet>
          You&apos;ve connected your GitHub account in Atlas:{" "}
          <span className="font-normal">@{user?.github}</span> |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => unlinkGithub()}
            onKeyDown={(e) => e.key === "Enter" && unlinkGithub()}
          >
            Disconnect
          </button>
        </ConditionRow>
      )
    }

    if (user?.notDeveloper) {
      return (
        <ConditionRow isMet>
          You&apos;ve identified yourself as not a developer in Atlas |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => linkGithub()}
            onKeyDown={(e) => e.key === "Enter" && linkGithub()}
          >
            Connect GitHub
          </button>{" "}
          |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => toggleIsDeveloper()}
            onKeyDown={(e) => e.key === "Enter" && toggleIsDeveloper()}
          >
            I&apos;m a developer
          </button>
        </ConditionRow>
      )
    }

    return (
      <ConditionRow isMet={false}>
        You&apos;ve connected your GitHub account in Atlas |{" "}
        <button
          type="button"
          className={LINK_STYLE}
          onClick={() => linkGithub()}
          onKeyDown={(e) => e.key === "Enter" && linkGithub()}
        >
          Connect GitHub
        </button>{" "}
        |{" "}
        <button
          type="button"
          className={LINK_STYLE}
          onClick={() => toggleIsDeveloper()}
          onKeyDown={(e) => e.key === "Enter" && toggleIsDeveloper()}
        >
          I&apos;m not a developer
        </button>
      </ConditionRow>
    )
  }

  const refreshPassportText =
    qualification?.type === "citizen" &&
    (qualification.identifier === "citizen" ||
      qualification.identifier === "user") ? (
      <>
        <button
          type="button"
          onClick={() => refreshPassport()}
          className={LINK_STYLE}
        >
          Refresh your passport
        </button>{" "}
        if you enabled{" "}
        <Link
          className={LINK_STYLE}
          href="https://passport.gitcoin.co/"
          target="_blank"
        >
          Optimism stamps
        </Link>{" "}
        in the Gitcoin Scorer section
      </>
    ) : (
      <>
        <Link
          className={LINK_STYLE}
          href="https://passport.gitcoin.co/"
          target="_blank"
        >
          Build your passport
        </Link>{" "}
        with Optimism stamps to level up your score
      </>
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="font-normal text-xl text-foreground">Requirements</div>
      <div className="flex flex-col gap-1 text-secondary-foreground">
        {renderEmail()}
        {renderAddress()}
        {renderGithub()}
        <ConditionRow
          isMet={
            !!userPassports?.find(
              (passport: UserPassport) =>
                passport.score >= VALID_PASSPORT_THRESHOLD,
            )
          }
        >
          You&apos;ve added an Optimism Passport | {refreshPassportText}
        </ConditionRow>
        <ConditionRow isMet={!!userWorldId?.verified}>
          You&apos;ve verified on Worldcoin |{" "}
          {userWorldId?.verified ? (
            <span className="font-normal">Verified</span>
          ) : (
            <WorldConnection userVerified={false} />
          )}
        </ConditionRow>
      </div>
    </div>
  )
}

const ReadOnlyRequirements = ({
  user,
  userPassports,
  userWorldId,
}: {
  user: HookedUser
  userPassports: UserPassport[] | undefined
  userWorldId:
    | ReturnType<typeof useUserWorldId>["data"]
    | undefined
}) => {
  const email = user?.emails?.[0]
  const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <div className="font-normal text-xl text-foreground">
        Requirements (Read Only)
      </div>
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
      <ConditionRow isMet={!!user?.github || user?.notDeveloper}>
        {user?.github ? (
          <>
            GitHub connected: <span className="font-normal">@{user?.github}</span>
          </>
        ) : user?.notDeveloper ? (
          <>Marked as not a developer.</>
        ) : (
          <>GitHub not connected.</>
        )}
      </ConditionRow>
      <ConditionRow
        isMet={!!userPassports?.find(
          (passport: UserPassport) =>
            passport.score >= VALID_PASSPORT_THRESHOLD,
        )}
      >
        {userPassports?.find(
          (passport: UserPassport) =>
            passport.score >= VALID_PASSPORT_THRESHOLD,
        )
          ? "Passport linked."
          : "Optimism Passport not linked."}
      </ConditionRow>
      <ConditionRow isMet={!!userWorldId?.verified}>
        {userWorldId?.verified
          ? "World ID verified."
          : "World ID not verified."}
      </ConditionRow>
      <div className="text-xs text-muted-foreground">
        Profile updates are disabled while impersonating.
      </div>
    </div>
  )
}

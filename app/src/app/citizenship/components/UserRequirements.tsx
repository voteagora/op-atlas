"use client"

import { UserAddress, UserPassport } from "@prisma/client"
import Link from "next/link"

import { ConditionRow } from "@/app/citizenship/components/ConditionRow"
import { WorldConnection } from "@/components/profile/WorldIdConnection"
import { useUser } from "@/hooks/db/useUser"
import { useUserPassports } from "@/hooks/db/useUserPassports"
import { useUserWorldId } from "@/hooks/db/useUserWorldId"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { useRefreshPassport } from "@/hooks/useRefreshPassport"
import { CitizenshipQualification } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

const LINK_STYLE = "inline-block cursor-pointer underline"

export const UserRequirements = ({
  userId,
  qualification,
}: {
  userId: string
  qualification: CitizenshipQualification | null
}) => {
  const { user } = useUser({ id: userId })
  const { data: userPassports } = useUserPassports({ id: userId })
  const { data: userWorldId } = useUserWorldId({ id: userId })

  const { linkEmail, updateEmail } = usePrivyEmail(userId)
  const { refreshPassport } = useRefreshPassport(userId)
  const { linkWallet } = usePrivyLinkWallet(userId)
  const { linkGithub, unlinkGithub, toggleIsDeveloper } =
    usePrivyLinkGithub(userId)
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

  const renderGithub = () => {
    if (user?.github) {
      return (
        <ConditionRow isMet={true}>
          You&apos;ve connected your GitHub account in Atlas:{" "}
          <span className="font-semibold">@{user?.github}</span> |{" "}
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
        <ConditionRow isMet={true}>
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

  const renderPassport = () => {
    if (!userPassports) {
      return null
    }

    const passport = userPassports.find(
      (passport: UserPassport) => Number(passport.score) >= 20.0,
    )
    const invalidPassport = userPassports.length > 0 && !passport

    if (passport) {
      return (
        <ConditionRow isMet={true}>
          Passport{" "}
          <span className="font-semibold">
            {truncateAddress(passport?.address as string)}
          </span>{" "}
          verified! Your score is{" "}
          <span className="font-semibold">
            {Number(passport?.score).toFixed(2)}
          </span>{" "}
          |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => refreshPassport()}
            onKeyDown={(e) => e.key === "Enter" && refreshPassport()}
          >
            Refresh
          </button>
        </ConditionRow>
      )
    }

    if (invalidPassport) {
      return (
        <ConditionRow isMet={false}>
          Low passport score. Verify one of your addresses on{" "}
          <Link
            href="https://app.passport.xyz"
            target="_blank"
            className={LINK_STYLE}
          >
            passport.xyz
          </Link>{" "}
          then{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => refreshPassport()}
            onKeyDown={(e) => e.key === "Enter" && refreshPassport()}
          >
            refresh
          </button>
          .
        </ConditionRow>
      )
    }

    if (govAddress) {
      return (
        <ConditionRow isMet={false}>
          Verify your Human Passport:{" "}
          {truncateAddress(govAddress.address as string)} |{" "}
          <button
            type="button"
            className={LINK_STYLE}
            onClick={() => refreshPassport()}
            onKeyDown={(e) => e.key === "Enter" && refreshPassport()}
          >
            Verify
          </button>
        </ConditionRow>
      )
    }

    return null
  }

  const renderWorld = () => {
    if (userWorldId?.verified) {
      return (
        <ConditionRow isMet={true}>
          You&apos;ve connected your World ID
        </ConditionRow>
      )
    }

    return (
      <ConditionRow isMet={false}>
        <WorldConnection userId={userId}>
          <span className={LINK_STYLE}>Connect your World ID</span>
        </WorldConnection>
      </ConditionRow>
    )
  }

  const renderEligibility = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="font-semibold text-xl">Eligibility</div>
        <div>
          <div className="font-semibold">Onchain activity</div>
          <div>
            One of your verified addresses must meet these criteria.{" "}
            <Link href="/profile/verified-addresses" className={LINK_STYLE}>
              Verify more addresses
            </Link>
          </div>
        </div>

        <div>
          <ConditionRow isMet={qualification ? true : false}>
            Your first Superchain transaction happened before June 2024
          </ConditionRow>
          <ConditionRow isMet={qualification ? true : false}>
            You&apos;ve had 2 transactions per month, in at least 3 of 6
            previous months.
          </ConditionRow>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {renderEligibility()}

      <div className="font-semibold text-xl text-foreground">Requirements</div>
      <div className="font-semibold text-foreground">Atlas Profile</div>
      <div className="text-secondary-foreground">
        {renderGithub()}
        {renderEmail()}
        {renderAddress()}
      </div>
      <div className="text-secondary-foreground">
        <div className="font-semibold text-foreground">Proof of personhood</div>
        <div className="text-secondary-foreground">
          Complete at least one of these options.
        </div>
      </div>
      <div className="text-secondary-foreground">
        {renderPassport()}
        {renderWorld()}
      </div>
    </div>
  )
}

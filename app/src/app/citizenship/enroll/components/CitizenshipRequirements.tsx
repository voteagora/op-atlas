"use client"

import { Check, Close } from "@/components/icons/reminx"
import { WorldConnection } from "@/components/profile/WorldIdConnection"
import { useUser } from "@/hooks/db/useUser"
import { useUserPOH } from "@/hooks/db/useUserPOH"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { useRefreshPassport } from "@/hooks/useRefreshPassport"
import { UserPOH } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { UserAddress } from "@prisma/client"
import Link from "next/link"

const LINK_STYLE = "inline-block cursor-pointer underline hover:no-underline"

export const CitizenshipRequirements = ({ userId }: { userId: string }) => {

    const { user } = useUser({ id: userId })
    const { data: pohData } = useUserPOH({ id: userId })
    const { linkEmail, updateEmail } = usePrivyEmail(userId)
    const { refreshPassport } = useRefreshPassport(userId)
    const { linkWallet } = usePrivyLinkWallet(userId)
    const { linkGithub, unlinkGithub, toggleIsDeveloper } = usePrivyLinkGithub(userId)

    const email = user?.emails?.[0];

    const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)
    const worldCondition = Boolean(pohData?.some((poh: UserPOH) => poh.source === "world"))

    const renderEmail = () => {
        if (email) {
            return <ConditionRow isMet={true}>You've added email in Atlas: <span className="font-semibold">{email.email}</span> | <div className={LINK_STYLE} onClick={() => updateEmail()}>Edit</div></ConditionRow>
        } else {
            return <ConditionRow isMet={false}>You've added email in Atlas | <div className={LINK_STYLE} onClick={() => linkEmail()}>Add your email</div></ConditionRow>
        }
    }

    const renderAddress = () => {
        const connectedAddress = user?.addresses?.[0]

        // Governance address is good to go
        if (govAddress) {
            return <ConditionRow isMet={true}>You've added a governance address in Atlas: <span className="font-semibold">{truncateAddress(govAddress.address as string)}</span> | <Link href="/profile/verified-addresses" className={LINK_STYLE}>Edit</Link></ConditionRow>
        }
        // If user has a connected address but didn't set it as governance address
        if (connectedAddress) {
            return <ConditionRow isMet={false}>You've added a governance address in Atlas | <Link href="/profile/verified-addresses" className={LINK_STYLE}>Set {truncateAddress(connectedAddress.address as string)} as Governance Address</Link></ConditionRow>
        } else {
            // If a user does not have a connected address
            return <ConditionRow isMet={false}>You've added a governance address in Atlas | <div className={LINK_STYLE} onClick={() => linkWallet()}>Add your address</div></ConditionRow>
        }
    }

    const renderGithub = () => {

        // Github connected
        if (user?.github) {
            return <ConditionRow isMet={true}>You've connected your GitHub account in Atlas: <span className="font-semibold">@{user?.github}</span> | <div className={LINK_STYLE} onClick={() => unlinkGithub()}>Disconnect</div></ConditionRow>
        } else {

            // User not a developer
            if (user?.notDeveloper) {
                return <ConditionRow isMet={true}>You've identified yourself as not a developer in Atlas | <div className={LINK_STYLE} onClick={() => linkGithub()}>Connect GitHub</div> | <div className={LINK_STYLE} onClick={() => toggleIsDeveloper()}>I'm a developer</div></ConditionRow>
            } else {
                return <ConditionRow isMet={false}>You've connected your GitHub account in Atlas | <div className={LINK_STYLE} onClick={() => linkGithub()}>Connect GitHub</div> | <div className={LINK_STYLE} onClick={() => toggleIsDeveloper()}>I'm not a developer</div></ConditionRow>
            }
        }
    }

    const renderPassport = () => {

        if (!pohData) {
            return null
        }

        const passport = pohData?.find((poh: UserPOH) => poh.source === "passport")
        const validPassport = Boolean(passport && passport.sourceMeta?.score > passport.sourceMeta?.threshold)
        const invalidPassport = Boolean(passport && passport.sourceMeta?.score <= passport.sourceMeta?.threshold)

        // Passport verified
        if (validPassport) {
            return <ConditionRow isMet={true}>Passport <span className="font-semibold">{truncateAddress(passport?.sourceId as string)}</span> verified! Your score is <span className="font-semibold">{Number(passport?.sourceMeta?.score).toFixed(2)}</span> | <div className={LINK_STYLE} onClick={() => refreshPassport()}>Refresh</div></ConditionRow>
        }

        // Passport score below threshold
        if (invalidPassport) {
            return <ConditionRow isMet={false}>Passport score is below threshold. Verify {truncateAddress(passport?.sourceId as string)} on <Link href="https://app.passport.xyz" target="_blank" className={LINK_STYLE}>passport.xyz</Link></ConditionRow>
        }

        // Verify passport
        if (govAddress) {
            return <ConditionRow isMet={false}>Verify your Gitcoin Passport: {truncateAddress(govAddress.address as string)} | <div className={LINK_STYLE} onClick={() => refreshPassport()}>Verify</div></ConditionRow>
        }

        // Gov address required
        return <ConditionRow isMet={false}>Verify governance address to add a verified address.</ConditionRow>
    }


    const renderWorld = () => {
        if (worldCondition) {
            return <ConditionRow isMet={false}>Connect your World ID. Connect with Worldchain</ConditionRow>
        } else {
            return <ConditionRow isMet={true}>You've connected your World ID. <WorldConnection userId={userId} className={LINK_STYLE}>Connect with Worldchain</WorldConnection></ConditionRow>
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="font-semibold text-xl">Requirements</div>

            <div className="font-semibold">Atlas Profile</div>

            <div>
                {renderGithub()}
                {renderEmail()}
                {renderAddress()}
            </div>
            <div>
                <div className="font-semibold">Proof of personhood</div>
                <div>Complete at least one of these options.</div>
            </div>

            <div>
                {renderPassport()}
                {renderWorld()}
            </div>
        </div>
    )
}

const ConditionRow = ({ children, isMet }: { children: React.ReactNode; isMet: boolean }) => {
    return (
        <div className="flex items-center gap-3">
            {isMet ? <Check className="w-[20px] h-[20px]" fill={"#0DA529"} /> : <Close className="w-[20px] h-[20px]" fill={"#BCBFCD"} />}
            <span>{children}</span>
        </div>
    )
}
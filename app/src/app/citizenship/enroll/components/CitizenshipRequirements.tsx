"use client"

import { Check, Close } from "@/components/icons/reminx"
import { useUser } from "@/hooks/db/useUser"
import { useUserPOH } from "@/hooks/db/useUserPOH"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { useRefreshPassport } from "@/hooks/useRefreshPassport"
import { UserPOH } from "@/lib/types"
import { truncateAddress } from "@/lib/utils/string"
import { UserAddress } from "@prisma/client"

export const CitizenshipRequirements = ({ userId }: { userId: string }) => {

    const { user } = useUser({ id: userId })
    const { data: pohData } = useUserPOH({ id: userId })
    const { linkEmail } = usePrivyEmail(userId)
    const { refreshPassport } = useRefreshPassport(userId)


    const emailCondition = Boolean(user?.emails?.length)

    // Address
    const govAddress = user?.addresses?.find((addr: UserAddress) => addr.primary)
    const addrCondition = Boolean(govAddress)

    const gitCondition = Boolean(user?.github !== null || user?.notDeveloper === true)

    const passport = pohData?.find((poh: UserPOH) => poh.source === "passport")
    const passportCondition = Boolean(passport && passport.sourceMeta?.score > passport.sourceMeta?.threshold)

    const worldCondition = Boolean(pohData?.some((poh: UserPOH) => poh.source === "world"))





    return (
        <div className="flex flex-col gap-6">
            <div className="font-semibold text-xl">Requirements</div>

            <div className="font-semibold">Atlas Profile</div>

            <div>
                <ConditionRow isMet={gitCondition}>If you're a developer, you've connected your GitHub account in Atlas.</ConditionRow>
                <ConditionRow isMet={emailCondition}>You've added email in Atlas | <div className="inline-block cursor-pointer underline hover:no-underline" onClick={() => linkEmail()}>Add email</div></ConditionRow>
                <ConditionRow isMet={addrCondition}>You've added a governance address in Atlas.</ConditionRow>
            </div>
            <div>
                <div className="font-semibold">Proof of personhood</div>
                <div>Complete at least one of these options.</div>
            </div>

            <div>
                {passportCondition ? (
                    <ConditionRow isMet={passportCondition}>Passport verified! Your score is {passport?.sourceMeta?.score} for {truncateAddress(passport?.sourceId as string)} | <div className="inline-block cursor-pointer underline hover:no-underline" onClick={() => refreshPassport()}>Refresh</div></ConditionRow>
                ) : (
                    <div>
                        {addrCondition && govAddress ? (
                            <ConditionRow isMet={false}>Verify your Gitcoin Passport: {truncateAddress(govAddress.address as string)} | <div className="inline-block cursor-pointer underline hover:no-underline" onClick={() => refreshPassport()}>Verify</div></ConditionRow>
                        ) : (
                            <ConditionRow isMet={false}>Verify governance address to add a verified address.</ConditionRow>
                        )}
                    </div>
                )}

                <ConditionRow isMet={worldCondition}>Connect your World ID. Connect with Worldchain</ConditionRow>
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